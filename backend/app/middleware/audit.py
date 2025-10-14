from starlette.middleware.base import BaseHTTPMiddleware
from app.db.session import SessionLocal  # ✅ use SessionLocal, not get_db
from app.models.auditlog import AuditLog
from app.core.security import decode_access_token
import uuid
from datetime import datetime

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        # extract token
        auth = request.headers.get("authorization")
        token = auth.split(" ", 1)[1].strip() if auth and auth.lower().startswith("bearer ") else None

        user_id = None
        if token:
            try:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
            except Exception:
                pass

        ip_address = request.headers.get("x-forwarded-for") or (
            request.client.host if request.client else None
        )

        # ✅ Use an independent DB session (async-safe)
        async with SessionLocal() as db:
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
