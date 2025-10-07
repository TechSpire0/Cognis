# backend/app/utils/audit_utils.py
from datetime import datetime
import uuid
from app.models.auditlog import AuditLog
import os
from pydub.utils import which

os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"
from pydub import AudioSegment
AudioSegment.converter = which("ffmpeg")


async def create_audit(db, user_id: str | None, ip_address: str | None, action_type: str, method: str, path: str, status_code: int, user_agent: str | None = None):
    al = AuditLog(
        id=uuid.uuid4(),
        method=method,
        path=path,
        status_code=status_code,
        timestamp=datetime.utcnow(),
        user_agent=user_agent,
        user_id=user_id,
        ip_address=ip_address,
        action_type=action_type,
    )
    db.add(al)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
