import os
import hashlib
import uuid
import csv
import xml.etree.ElementTree as ET
import tempfile
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, String
from sqlalchemy.exc import IntegrityError
from app.utils.parsers import parse_csv, parse_xml, parse_image, parse_audio, parse_document, parse_text, parse_video
from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.utils.file_utils import safe_extract_zip, make_tempdir
from app.utils.embedding_utils import generate_embedding
import shutil

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


# ---------- ZIP Parser ----------
def parse_zip(file_path: str):
    """Safely extract and parse supported files inside a ZIP."""
    artifacts = []
    supported_exts = (".csv", ".xml", ".jpg", ".png", ".mp3", ".wav", ".pdf", ".doc", ".txt", ".mp4", ".mkv")

    tmp_dir_path, tmp_obj = make_tempdir(prefix="ufdr_ex_")
    try:
        extracted_files = safe_extract_zip(file_path, tmp_dir_path)
        for fpath in extracted_files:
            lower = fpath.lower()
            if not lower.endswith(supported_exts):
                continue

            # Parse based on type
            if lower.endswith(".csv"):
                artifacts.extend(parse_csv(fpath))
            elif lower.endswith(".xml"):
                artifacts.extend(parse_xml(fpath))
            elif lower.endswith((".jpg", ".png")):
                artifacts.extend(parse_image(fpath))
            elif lower.endswith((".mp3", ".wav")):
                artifacts.extend(parse_audio(fpath))
            elif lower.endswith((".pdf", ".doc")):
                artifacts.extend(parse_document(fpath))
            elif lower.endswith(".txt"):
                artifacts.extend(parse_text(fpath))
            elif lower.endswith((".mp4", ".mkv")):
                artifacts.extend(parse_video(fpath))

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
    """Secure UFDR upload handler (ZIP-only)."""
    MAX_UPLOAD_BYTES = 500 * 1024 * 1024  # 500 MB
    allowed_exts = (".zip",)  # 🚫 Only ZIP uploads allowed

    raw_filename = (file.filename or "upload").replace("/", "_").replace("\\", "_")
    lower_fname = raw_filename.lower()
    if not any(lower_fname.endswith(ext) for ext in allowed_exts):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")

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
        shutil.move(tmp_path, final_path)

    except HTTPException:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise
    except Exception as e:
        import traceback
        print("UPLOAD ERROR:", traceback.format_exc())
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


    # Insert UFDR record
    ufdr = UFDRFile(
        case_id=None,
        filename=raw_filename,
        storage_path=final_path,
        meta={"hash": file_hash, "uploaded_by": str(current_user.id)},
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

    # Parse contents of ZIP
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

        # Compute semantic embedding for RAG
        try:
            emb = generate_embedding(a.get("text") or "")
        except Exception as e:
            emb = None

        if emb:
            art.embedding = emb

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


# ---------- List Endpoint ----------
@router.get("/list")
async def list_ufdr_files(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List UFDR files.
    - Admins see all files.
    - Investigators see only their own uploads.
    """
    if getattr(current_user, "role", None) == "admin":
        stmt = select(UFDRFile)
    else:
        stmt = select(UFDRFile).where(
            UFDRFile.meta["uploaded_by"].cast(String) == str(current_user.id)
        )

    result = await db.execute(stmt)
    files = result.scalars().all()

    return [
        {
            "id": str(f.id),
            "filename": f.filename,
            "hash": f.meta.get("hash") if isinstance(f.meta, dict) else None,
            "uploaded_by": f.meta.get("uploaded_by") if isinstance(f.meta, dict) else None,
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
        }
        for f in files
    ]
