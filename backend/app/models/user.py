import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Enum as PgEnum, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class UserRole(str, enum.Enum):
    investigator = "investigator"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    role = Column(PgEnum(UserRole, name="userrole"), nullable=False)

    # 🔒 New fields
    force_password_change = Column(Boolean, nullable=False, default=False)
    last_password_changed = Column(DateTime, nullable=True, default=None)

    cases = relationship("Case", back_populates="user")
