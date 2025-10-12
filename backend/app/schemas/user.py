from uuid import UUID
from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional
from datetime import datetime

# ---------- Roles ----------
class UserRole(str, Enum):
    investigator = "investigator"
    admin = "admin"


# ---------- Base ----------
class UserBase(BaseModel):
    username: str
    email: EmailStr


# ---------- Create ----------
class UserCreate(UserBase):
    password: str
    role: UserRole


# ---------- Admin Create (New) ----------
class AdminCreate(UserBase):
    role: UserRole
    temp_password: Optional[str] = None  # optional override


# ---------- Change Password ----------
class ChangePassword(BaseModel):
    username_or_email: str
    old_password: str
    new_password: str


# ---------- Read/Output ----------
class UserRead(UserBase):
    id: UUID
    role: UserRole

    class Config:
        from_attributes = True


# ---------- Response for APIs ----------
class UserOut(BaseModel):
    id: UUID
    username: str
    email: EmailStr
    role: UserRole
    force_password_change: Optional[bool] = False
    last_password_changed: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Auth Token ----------
class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginInput(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    password: str
