# app/api/routes/artifacts.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile
from app.models.case_assignment import CaseAssignment
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

    # --- Authorization: Admins can see everything ---
    if current_user.role != "admin":
        # ✅ Check if investigator is assigned to this case
        if not ufdr.case_id:
            raise HTTPException(status_code=403, detail="This UFDR is not linked to a case.")
        
        assign_check = await db.execute(
            select(CaseAssignment).where(
                CaseAssignment.case_id == ufdr.case_id,
                CaseAssignment.user_id == current_user.id,
            )
        )
        assigned = assign_check.scalars().first()
        if not assigned:
            raise HTTPException(status_code=403, detail="Not authorized to access this UFDR file.")

    # --- Build query ---
    stmt = select(Artifact).where(Artifact.ufdr_file_id == ufdr_file_id)

    # 🧠 Full-Text Search (FTS)
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
            "case_id": str(a.case_id) if a.case_id else None,
        }
        for a in artifacts
    ]
