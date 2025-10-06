# backend/app/api/routes/ufdr.py
import os, hashlib, uuid, zipfile, csv, xml.etree.ElementTree as ET
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/ufdr", tags=["UFDR"])


def sha256sum_from_path(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


async def save_upload_file(upload_file: UploadFile, dest_path: str):
    contents = await upload_file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)


# ---------- Parsers ----------
async def parse_csv(file_path: str):
    artifacts = []
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if "number" in row and "duration" in row:  # call log
                artifacts.append({
                    "type": "call",
                    "text": f"Call to {row['number']} duration {row['duration']}s",
                })
            elif "name" in row and "phone" in row:  # contact
                artifacts.append({
                    "type": "contact",
                    "text": f"{row['name']} - {row['phone']}",
                })
            else:
                artifacts.append({
                    "type": "csv_row",
                    "text": str(row),
                })
    return artifacts


async def parse_xml(file_path: str):
    artifacts = []
    tree = ET.parse(file_path)
    root = tree.getroot()

    # Contacts
    for elem in root.findall(".//contact"):
        name = elem.attrib.get("name") or elem.findtext("name")
        number = elem.attrib.get("number") or elem.findtext("number")
        if name or number:
            artifacts.append({
                "type": "contact",
                "text": f"{name or ''} - {number or ''}".strip(" -"),
            })

    # SMS (generic Android-style)
    for sms in root.findall(".//sms"):
        sender = sms.attrib.get("address") or sms.findtext("address")
        body = sms.attrib.get("body") or sms.findtext("body")
        if body:
            artifacts.append({
                "type": "message",
                "text": f"SMS from {sender}: {body}",
            })

    # WhatsApp messages
    for msg in root.findall(".//message"):
        sender = msg.attrib.get("sender") or msg.findtext("sender")
        body = msg.attrib.get("body") or msg.findtext("body")
        if body:
            artifacts.append({
                "type": "whatsapp",
                "text": f"WhatsApp from {sender}: {body}",
            })

    # Call logs
    for call in root.findall(".//call"):
        number = call.attrib.get("number") or call.findtext("number")
        duration = call.attrib.get("duration") or call.findtext("duration")
        if number:
            artifacts.append({
                "type": "call",
                "text": f"Call to {number}, duration {duration or '?'}s",
            })

    return artifacts


async def parse_zip(file_path: str):
    artifacts = []
    with zipfile.ZipFile(file_path, "r") as zip_ref:
        extract_dir = file_path + "_extracted"
        zip_ref.extractall(extract_dir)
        for root, _, files in os.walk(extract_dir):
            for fname in files:
                fpath = os.path.join(root, fname)
                if fname.endswith(".csv"):
                    artifacts.extend(await parse_csv(fpath))
                elif fname.endswith(".xml"):
                    artifacts.extend(await parse_xml(fpath))
    return artifacts


# ---------- Upload Endpoint ----------
@router.post("/upload")
async def upload_ufdr(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = file.filename.replace("/", "_").replace("\\", "_")
    unique_suffix = uuid.uuid4().hex[:8]
    stored_filename = f"{unique_suffix}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    await save_upload_file(file, file_path)
    file_hash = sha256sum_from_path(file_path)

    # Duplicate check
    result = await db.execute(select(UFDRFile).where(UFDRFile.meta.op("->>")("hash") == file_hash))
    existing = result.scalars().first()
    if existing:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="File already uploaded")

    ufdr = UFDRFile(
        case_id=None,
        filename=filename,
        storage_path=file_path,
        meta={"hash": file_hash},
        uploaded_at=datetime.utcnow(),
    )
    db.add(ufdr)
    await db.commit()
    await db.refresh(ufdr)

    # Parse file depending on type
    artifacts = []
    if filename.endswith(".csv"):
        artifacts = await parse_csv(file_path)
    elif filename.endswith(".xml"):
        artifacts = await parse_xml(file_path)
    elif filename.endswith(".zip"):
        artifacts = await parse_zip(file_path)

    created_artifact_ids = []
    for a in artifacts:
        art = Artifact(
            case_id=None,
            ufdr_file_id=ufdr.id,
            type=a["type"],
            extracted_text=a["text"],
            raw=a,
            created_at=datetime.utcnow(),
        )
        db.add(art)
        await db.flush()
        created_artifact_ids.append(str(art.id))

    await db.commit()

    return {
        "id": str(ufdr.id),
        "filename": ufdr.filename,
        "hash": file_hash,
        "uploaded_at": ufdr.uploaded_at.isoformat(),
        "artifacts_parsed": len(created_artifact_ids),
    }
