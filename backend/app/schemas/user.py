from uuid import UUID
from pydantic import BaseModel, EmailStr
from enum import Enum

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
