# backend/app/api/routes/audit.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from datetime import timedelta

from app.core.security import get_current_user
from app.db.deps import get_db
from app.models.user import User
from app.models.auditlog import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])

IST_OFFSET = timedelta(hours=5, minutes=30) 

@router.get("/logs")
async def list_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    # load user relationship so `l.user` is populated
    result = await db.execute(
        select(AuditLog).options(joinedload(AuditLog.user)).order_by(AuditLog.timestamp.desc()).limit(100)
    )
    logs = result.scalars().all()

    return [
        {
            "id": str(l.id),
            "method": l.method,
            "path": l.path,
            "status_code": l.status_code,
            # optionally convert to IST before sending — you may already do this elsewhere
            # "timestamp": (l.timestamp + IST_OFFSET).isoformat() if l.timestamp else None,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
            "user_agent": l.user_agent,
            "ip_address": l.ip_address,
            "action_type": l.action_type,
            "user": {
                "id": str(l.user.id),
                "username": l.user.username,
                "role": l.user.role.value if hasattr(l.user.role, "value") else l.user.role,
                "email": l.user.email,
            } if l.user else None,
        }
        for l in logs
    ]
