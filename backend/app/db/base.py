# app/db/base.py
from app.db.base_class import Base

# Import all models so Alembic can detect them
from app.models.user import User
from app.models.case import Case
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact
from app.models.auditlog import AuditLog
from app.models.chat_session import ChatSession
from app.models.case_assignment import CaseAssignment
