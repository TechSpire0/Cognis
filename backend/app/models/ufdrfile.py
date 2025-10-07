from sqlalchemy import Column, String, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base

class UFDRFile(Base):
    __tablename__ = "ufdr_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), nullable=True)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    meta = Column(JSON, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # relationship back to artifacts
    artifacts = relationship("Artifact", back_populates="ufdr_file", cascade="all, delete")
