# backend/app/middleware/audit.py
from starlette.middleware.base import BaseHTTPMiddleware
from app.db.deps import get_db
from app.models.auditlog import AuditLog
from app.core.security import decode_access_token
import uuid
from datetime import datetime

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # extract token-sub if present
        token = None
        auth = request.headers.get("authorization")
        if auth and auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()

        user_id = None
        if token:
            try:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
            except Exception:
                user_id = None

        ip_address = request.headers.get("x-forwarded-for") or (request.client.host if request.client else None)

        # write log via DB dependency (get_db yields session)
        async for db in get_db():
            log = AuditLog(
                id=uuid.uuid4(),
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                timestamp=datetime.utcnow(),
                user_agent=request.headers.get("user-agent"),
                user_id=user_id,
                ip_address=ip_address,
                action_type=None,
            )
            db.add(log)
            try:
                await db.commit()
            except Exception:
                await db.rollback()

        return response
