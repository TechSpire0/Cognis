# app/main.py
import app.db.base
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.audit import AuditMiddleware
from app.api.routes import auth, users, ufdr, artifacts, conversation, dashboard, audit, admin
from app.api.routes import cases as cases_router
from app.db.session import get_db
from sqlalchemy.future import select
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.models import User
from app.db.session import SessionLocal

app = FastAPI(title="Cognis Backend")

# Add audit middleware
app.add_middleware(AuditMiddleware)

# CORS — loosened for development; change later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers with API versioning
app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(cases_router.router, prefix="/api/v1")
app.include_router(ufdr.router, prefix="/api/v1")
app.include_router(artifacts.router, prefix="/api/v1")
app.include_router(conversation.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")


@app.on_event("startup")
async def create_default_admin():
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        admin = result.scalars().first()

        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role="admin",
                force_password_change=True,
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            print("✅ Default admin created (username=admin, password=admin)")
        else:
            print("ℹ️ Default admin already exists.")


# TRUNCATE TABLE users, cases, ufdr_files, artifacts, audit_logs RESTART IDENTITY CASCADE;