# app/main.py
import app.db.base # noqa: F401

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.middleware.audit import AuditMiddleware
# Now import routers (they can safely import models directly)
from app.api.routes import auth, users, ufdr, artifacts, conversation, dashboard, audit
from app.api.routes import cases as cases_router
app = FastAPI(title="Cognis Backend")

# Add audit middleware
app.add_middleware(AuditMiddleware)

# CORS — loosened for development; change later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routers with API versioning
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(cases_router.router, prefix="/api/v1")
app.include_router(ufdr.router, prefix="/api/v1")
app.include_router(artifacts.router, prefix="/api/v1")
app.include_router(conversation.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")

#Reset the Database
# alembic downgrade base
# alembic upgrade head
# 76dd4ed9-e497-4c44-a83e-fecf56b4e170