# app/api/routes/artifacts.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy import func, text
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile
from app.models.user import User

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

@router.get("/list/{ufdr_file_id}")
async def list_artifacts(
    ufdr_file_id: str,
    q: str | None = Query(None, description="Keyword for FTS search"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --- Verify UFDR file exists ---
    result = await db.execute(select(UFDRFile).where(UFDRFile.id == ufdr_file_id))
    ufdr = result.scalars().first()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR file not found")

    # --- Authorization: allow admin or uploader ---
    if getattr(current_user, "role", None) != "admin":
        uploaded_by = ufdr.meta.get("uploaded_by") if isinstance(ufdr.meta, dict) else None
        if uploaded_by and str(uploaded_by) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")

    # --- Build query ---
    stmt = select(Artifact).where(Artifact.ufdr_file_id == ufdr_file_id)

    # 🧠 Full-Text Search (FTS) if query provided
    if q:
        stmt = stmt.where(
            func.to_tsvector("english", Artifact.extracted_text)
            .op("@@")(func.plainto_tsquery("english", q))
        )

    # 🧭 Pagination
    stmt = stmt.offset(skip).limit(limit)

    # --- Execute query ---
    result = await db.execute(stmt)
    artifacts = result.scalars().all()

    return [
        {
            "id": str(a.id),
            "type": a.type,
            "extracted_text": a.extracted_text,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "ufdr_file_id": str(a.ufdr_file_id),
        }
        for a in artifacts
    ]
