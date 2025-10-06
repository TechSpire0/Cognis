# backend/app/routers/auth.py
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # check if email exists
    q = await db.execute(select(User).where(User.email == user_in.email))
    existing = q.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.value if hasattr(user_in.role, "value") else user_in.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Accept either:
      - application/x-www-form-urlencoded (OAuth2 form: username + password)
      - application/json { "email": "...", "password": "..." } OR { "username": "...", "password": "..." }
    Returns: {"access_token": "...", "token_type":"bearer"}
    """
    content_type = request.headers.get("content-type", "")

    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        username_or_email = form.get("username")
        password = form.get("password")
    else:
        data = await request.json()
        # allow frontend to send email or username
        username_or_email = data.get("email") or data.get("username")
        password = data.get("password")

    if not username_or_email or not password:
        raise HTTPException(status_code=422, detail="username/email and password required")

    # Try lookup by email first, then username, then possibly username==email
    result = await db.execute(select(User).where(User.email == username_or_email))
    user = result.scalars().first()
    if not user:
        result = await db.execute(select(User).where(User.username == username_or_email))
        user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=60)
    token = create_access_token(
        data={"sub": str(user.id), "role": str(user.role)},
        expires_delta=access_token_expires,
    )

    return {"access_token": token, "token_type": "bearer"}


# simple endpoint to fetch current user
@router.get("/users/me", response_model=UserOut)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
