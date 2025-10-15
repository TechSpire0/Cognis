# backend/app/utils/audit_utils.py
from datetime import datetime, timedelta, timezone
import uuid
from app.models.auditlog import AuditLog
import os
from pydub.utils import which
from pydub import AudioSegment

# FFmpeg setup (for any media audit use)
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"
AudioSegment.converter = which("ffmpeg")


async def create_audit(
    db,
    user_id: str | None,
    ip_address: str | None,
    action_type: str,
    method: str,
    path: str,
    status_code: int,
    user_agent: str | None = None,
):
    """
    Create a new audit log entry.
    - Stores time as UTC-naive (DB safe)
    - Visually shifted to Asia/Kolkata (UTC+5:30)
    - Uses flush() to avoid transaction conflicts
    """
    try:
        # Convert UTC to IST (Asia/Kolkata = UTC + 5 hours 30 minutes)
        utc_now = datetime.utcnow()
        ist_now = utc_now + timedelta(hours=5, minutes=30)

        al = AuditLog(
            id=uuid.uuid4(),
            method=method,
            path=path,
            status_code=status_code,
            timestamp=ist_now,  # ✅ appears as IST but naive datetime
            user_agent=user_agent,
            user_id=user_id,
            ip_address=ip_address,
            action_type=action_type,
        )

        db.add(al)
        await db.flush()  # ✅ avoids asyncpg transaction rollback
    except Exception as e:
        print(f"[AUDIT ERROR] {e}")
