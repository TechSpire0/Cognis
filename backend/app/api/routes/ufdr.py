import os
import hashlib
import uuid
import tempfile
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError

from app.utils.parsers import (
    parse_csv, parse_xml, parse_image, parse_audio,
    parse_document, parse_text, parse_video
)
from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.models.case_assignment import CaseAssignment
from app.utils.file_utils import safe_extract_zip, make_tempdir
from app.utils.embedding_utils import generate_embedding
from app.utils.audit_utils import create_audit

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


def parse_zip(file_path: str):
    """Safely extract and parse supported files inside a ZIP."""
    artifacts = []
    supported_exts = (
        ".csv", ".xml", ".jpg", ".png", ".mp3", ".wav",
        ".pdf", ".doc", ".txt", ".mp4", ".mkv"
    )

    tmp_dir_path, tmp_obj = make_tempdir(prefix="ufdr_ex_")
    try:
        extracted_files = safe_extract_zip(file_path, tmp_dir_path)
        for fpath in extracted_files:
            lower = fpath.lower()
            if not lower.endswith(supported_exts):
                continue

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
    case_id: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Secure UFDR upload handler — investigators must provide valid case_id."""
    MAX_UPLOAD_BYTES = 500 * 1024 * 1024  # 500 MB
    allowed_exts = (".zip",)

    raw_filename = (file.filename or "upload").replace("/", "_").replace("\\", "_")
    if not raw_filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported")

    # -------- Investigator access check --------
    if current_user.role == "investigator":
        if not case_id:
            raise HTTPException(
                status_code=400,
                detail="case_id is required for investigators"
            )

        # Ensure they are assigned to this case
        res = await db.execute(
            select(CaseAssignment).where(
                and_(
                    CaseAssignment.case_id == case_id,
                    CaseAssignment.user_id == current_user.id,
                )
            )
        )
        if res.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=403,
                detail="You are not assigned to this case",
            )

    # -------- Save temporary file --------
    tmp_dir = tempfile.mkdtemp(prefix="upload_tmp_")
    tmp_path = os.path.join(tmp_dir, raw_filename)

    try:
        with open(tmp_path, "wb") as out_f:
            content = await file.read()
            if len(content) > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="File too large")
            out_f.write(content)

        file_hash = sha256sum_from_path(tmp_path)
        unique_suffix = uuid.uuid4().hex[:8]
        stored_filename = f"{unique_suffix}_{raw_filename}"
        final_path = os.path.join(UPLOAD_DIR, stored_filename)
        shutil.move(tmp_path, final_path)

    except Exception as e:
        import traceback
        print("UPLOAD ERROR:", traceback.format_exc())
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    # -------- Save UFDR record --------
    new_ufdr = UFDRFile(
        filename=file.filename,
        storage_path=final_path,
        meta={
            "uploaded_by": str(current_user.id),
            "uploaded_at": datetime.utcnow().isoformat(),
            "hash": file_hash,
        },
        case_id=case_id,
    )

    db.add(new_ufdr)
    try:
        await db.commit()
        await db.refresh(new_ufdr)
    except IntegrityError:
        await db.rollback()
        os.remove(final_path)
        raise HTTPException(status_code=400, detail="Duplicate UFDR file")

    # -------- Parse and embed artifacts --------
    artifacts = parse_zip(final_path)
    created_ids = []
    for a in artifacts:
        art = Artifact(
            case_id=case_id,
            ufdr_file_id=new_ufdr.id,
            type=a.get("type"),
            extracted_text=a.get("text"),
            raw=a,
            created_at=datetime.utcnow(),
        )

        try:
            emb = generate_embedding(a.get("text") or "")
            if emb:
                art.embedding = emb
        except Exception:
            pass

        db.add(art)
        await db.flush()
        created_ids.append(str(art.id))

    await db.commit()

    # -------- Audit Log --------
    await create_audit(
        db=db,
        user_id=str(current_user.id),
        ip_address=None,
        action_type="upload",
        method="POST",
        path="/ufdr/upload",
        status_code=201,
    )

    return {
        "id": str(new_ufdr.id),
        "filename": new_ufdr.filename,
        "hash": file_hash,
        "uploaded_at": new_ufdr.uploaded_at.isoformat(),
        "artifacts_parsed": len(created_ids),
    }


# ---------- List Endpoint ----------
@router.get("/list")
async def list_ufdr_files(
    case_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List UFDR files:
    - Admins: can view all UFDR files (optional case filter)
    - Investigators: must specify case_id and can only see their assigned case files
    """
    if current_user.role == "admin":
        stmt = select(UFDRFile)
        if case_id:
            stmt = stmt.where(UFDRFile.case_id == case_id)

    else:
        # Enforce case_id for investigators
        if not case_id:
            raise HTTPException(
                status_code=400,
                detail="case_id is required to view UFDR files for investigators"
            )

        # Verify case assignment
        res = await db.execute(
            select(CaseAssignment).where(
                and_(
                    CaseAssignment.case_id == case_id,
                    CaseAssignment.user_id == current_user.id,
                )
            )
        )
        if res.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=403,
                detail="You are not assigned to this case"
            )

        # Investigators can only see files for their assigned case
        stmt = select(UFDRFile).where(UFDRFile.case_id == case_id)

    result = await db.execute(stmt)
    files = result.scalars().all()

    return [
        {
            "id": str(f.id),
            "filename": f.filename,
            "hash": f.meta.get("hash") if isinstance(f.meta, dict) else None,
            "uploaded_by": f.meta.get("uploaded_by") if isinstance(f.meta, dict) else None,
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
            "case_id": str(f.case_id) if f.case_id else None,
        }
        for f in files
    ]
