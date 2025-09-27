# app/main.py
import app.db.base # noqa: F401

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.middleware.audit import AuditMiddleware
# Now import routers (they can safely import models directly)
from app.api.routes import auth, users, ufdr, health, artifacts, conversation, dashboard, audit
from app.api.routes import cases as cases_router
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

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cases_router.router)
app.include_router(ufdr.router)
app.include_router(artifacts.router)
app.include_router(conversation.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(health.router)
