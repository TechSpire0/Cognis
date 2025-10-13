# app/api/routes/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import asyncpg
from fastapi import status
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ---------------------------------------------------------
# SUMMARY ENDPOINT
# ---------------------------------------------------------
@router.get("/summary")
async def dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
                f"Total {total_artifacts} artifacts extracted from uploaded data. "
                f"System operational with all endpoints responding normally."
    }

# ---------------------------------------------------------
# HEALTH ENDPOINT ✅
# ---------------------------------------------------------
import asyncpg
from fastapi import status

@router.get("/health")
async def system_health(db: AsyncSession = Depends(get_db)):
    try:
        # Simple DB connection test
        await db.execute(select(func.count(User.id)))
        db_status = "Active"
    except Exception:
        db_status = "Unavailable"

    # API always healthy if this endpoint runs
    api_status = "Healthy"

    # Simulate a data sync status based on recent uploads
    result = await db.execute(select(func.count(UFDRFile.id)))
    file_count = result.scalar_one_or_none() or 0
    sync_status = "Stable" if file_count > 0 else "Idle"

    return {
        "database": db_status,
        "api": api_status,
        "data_sync": sync_status,
    }
