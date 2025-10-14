# app/api/routes/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.models.case_assignment import CaseAssignment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --- Admin: full access ---
    if current_user.role == "admin":
        total_users = await db.scalar(select(func.count(User.id)))
        total_files = await db.scalar(select(func.count(UFDRFile.id)))
        total_artifacts = await db.scalar(select(func.count(Artifact.id)))

        result = await db.execute(select(UFDRFile).order_by(UFDRFile.uploaded_at.desc()).limit(15))
        recent = result.scalars().all()

        return {
            "total_users": total_users,
            "total_ufdr_files": total_files,
            "total_artifacts": total_artifacts,
            "recent_uploads": [
                {"filename": f.filename, "uploaded_at": f.uploaded_at} for f in recent
            ],
            "insights": f"{total_users} registered users managing {total_files} UFDR files. "
                        f"Total {total_artifacts} artifacts extracted from uploaded data."
        }

    # --- Investigator: restricted to assigned cases ---
    assigned_stmt = select(CaseAssignment.case_id).where(CaseAssignment.user_id == current_user.id)
    assigned_res = await db.execute(assigned_stmt)
    assigned_case_ids = [row[0] for row in assigned_res.all()]

    if not assigned_case_ids:
        return {
            "total_users": 1,
            "total_ufdr_files": 0,
            "total_artifacts": 0,
            "recent_uploads": [],
            "insights": "No cases assigned yet."
        }

    total_files = await db.scalar(
        select(func.count(UFDRFile.id)).where(UFDRFile.case_id.in_(assigned_case_ids))
    )

    total_artifacts = await db.scalar(
        select(func.count(Artifact.id)).where(Artifact.case_id.in_(assigned_case_ids))
    )

    recent_res = await db.execute(
        select(UFDRFile)
        .where(UFDRFile.case_id.in_(assigned_case_ids))
        .order_by(UFDRFile.uploaded_at.desc())
        .limit(15)
    )
    recent = recent_res.scalars().all()

    return {
        "total_users": 1,
        "total_ufdr_files": total_files,
        "total_artifacts": total_artifacts,
        "recent_uploads": [
            {"filename": f.filename, "uploaded_at": f.uploaded_at} for f in recent
        ],
        "insights": f"You are assigned to {len(assigned_case_ids)} cases containing "
                    f"{total_files} UFDR files and {total_artifacts} total artifacts."
    }
