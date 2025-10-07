from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime
import uuid
from app.db.base import Base


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ufdr_file_id = Column(UUID(as_uuid=True), ForeignKey("ufdr_files.id"), nullable=False)
    case_id = Column(UUID(as_uuid=True), nullable=True)
    type = Column(String, nullable=True)
    extracted_text = Column(Text, nullable=True)
    raw = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    embedding = Column(Vector(384), nullable=True)
    ufdr_file = relationship("UFDRFile", back_populates="artifacts")
