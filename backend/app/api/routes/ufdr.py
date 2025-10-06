import os
import hashlib
import uuid
import csv
import xml.etree.ElementTree as ET
import tempfile
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.utils.file_utils import safe_extract_zip, make_tempdir

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/ufdr", tags=["UFDR"])


# ---------- Utility ----------
def sha256sum_from_path(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


# ---------- Parsers ----------
def parse_csv(file_path: str):
    artifacts = []
    with open(file_path, newline="", encoding="utf-8", errors="ignore") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            keys = {k.lower(): v for k, v in row.items()}
            if "number" in keys and "duration" in keys:
                artifacts.append({
                    "type": "call",
                    "text": f"Call to {keys.get('number')} duration {keys.get('duration')}s",
                })
            elif "name" in keys and "phone" in keys:
                artifacts.append({
                    "type": "contact",
                    "text": f"{keys.get('name')} - {keys.get('phone')}",
                })
            else:
                artifacts.append({
                    "type": "csv_row",
                    "text": str(row),
                })
    return artifacts


def parse_xml(file_path: str):
    artifacts = []
    try:
        tree = ET.parse(file_path)
    except ET.ParseError:
        return artifacts

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

    # SMS
    for sms in root.findall(".//sms"):
        sender = sms.attrib.get("address") or sms.findtext("address")
        body = sms.attrib.get("body") or sms.findtext("body")
        if body:
            artifacts.append({
                "type": "message",
                "text": f"SMS from {sender}: {body}",
            })

    # WhatsApp
    for msg in root.findall(".//message"):
        sender = msg.attrib.get("sender") or msg.findtext("sender")
        body = msg.attrib.get("body") or msg.findtext("body")
        if body:
            artifacts.append({
                "type": "whatsapp",
                "text": f"WhatsApp from {sender}: {body}",
            })

    # Calls
    for call in root.findall(".//call"):
        number = call.attrib.get("number") or call.findtext("number")
        duration = call.attrib.get("duration") or call.findtext("duration")
        if number:
            artifacts.append({
                "type": "call",
                "text": f"Call to {number}, duration {duration or '?'}s",
            })

    return artifacts


def parse_zip(file_path: str):
    """Safely extract and parse CSV/XML files inside a ZIP."""
    artifacts = []
    tmp_dir_path, tmp_obj = make_tempdir(prefix="ufdr_ex_")
    try:
        extracted_files = safe_extract_zip(file_path, tmp_dir_path)
        for fpath in extracted_files:
            lower = fpath.lower()
            if lower.endswith(".csv"):
                artifacts.extend(parse_csv(fpath))
            elif lower.endswith(".xml"):
                artifacts.extend(parse_xml(fpath))
    finally:
        try:
            tmp_obj.cleanup()
        except Exception:
            pass
    return artifacts


# ---------- Upload Endpoint ----------
@router.post("/upload")
async def upload_ufdr(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Secure UFDR upload handler."""
    MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB
    allowed_exts = (".csv", ".xml", ".zip")

    raw_filename = (file.filename or "upload").replace("/", "_").replace("\\", "_")
    lower_fname = raw_filename.lower()
    if not any(lower_fname.endswith(ext) for ext in allowed_exts):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Temporary save
    tmp_dir = tempfile.mkdtemp(prefix="upload_tmp_")
    tmp_path = os.path.join(tmp_dir, raw_filename)

    try:
        with open(tmp_path, "wb") as out_f:
            src = getattr(file, "file", None)
            if src is None:
                content = await file.read()
                if len(content) > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="File too large")
                out_f.write(content)
            else:
                src.seek(0)
                total = 0
                while True:
                    chunk = src.read(8192)
                    if not chunk:
                        break
                    total += len(chunk)
                    if total > MAX_UPLOAD_BYTES:
                        raise HTTPException(status_code=413, detail="File too large")
                    out_f.write(chunk)

        file_hash = sha256sum_from_path(tmp_path)
        unique_suffix = uuid.uuid4().hex[:8]
        stored_filename = f"{unique_suffix}_{raw_filename}"
        final_path = os.path.join(UPLOAD_DIR, stored_filename)
        os.replace(tmp_path, final_path)

    except HTTPException:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise
    except Exception:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail="Upload failed")

    # Insert UFDR record
    ufdr = UFDRFile(
        case_id=None,
        filename=raw_filename,
        storage_path=final_path,
        meta={"hash": file_hash},
        uploaded_at=datetime.utcnow(),
    )
    db.add(ufdr)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        os.remove(final_path)
        raise HTTPException(status_code=400, detail="File already uploaded")

    await db.refresh(ufdr)

    # Parse artifacts
    artifacts = []
    if lower_fname.endswith(".csv"):
        artifacts = parse_csv(final_path)
    elif lower_fname.endswith(".xml"):
        artifacts = parse_xml(final_path)
    elif lower_fname.endswith(".zip"):
        artifacts = parse_zip(final_path)

    created_ids = []
    for a in artifacts:
        art = Artifact(
            case_id=None,
            ufdr_file_id=ufdr.id,
            type=a.get("type"),
            extracted_text=a.get("text"),
            raw=a,
            created_at=datetime.utcnow(),
        )
        db.add(art)
        await db.flush()
        created_ids.append(str(art.id))

    await db.commit()

    return {
        "id": str(ufdr.id),
        "filename": ufdr.filename,
        "hash": file_hash,
        "uploaded_at": ufdr.uploaded_at.isoformat(),
        "artifacts_parsed": len(created_ids),
    }
