# backend/app/api/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from app.models.user import User
from app.schemas.user import Token, ChangePassword, UserOut
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.db.deps import get_db
from app.utils.audit_utils import create_audit
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])



# -----------------------------------------------------------
# LOGIN ENDPOINT
# -----------------------------------------------------------
@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Handles:
    - Swagger OAuth2 form data
    - JSON payloads from frontend
    """
    username_or_email = form_data.username
    password = form_data.password

    # Handle raw JSON payloads
    if not username_or_email or not password:
        try:
            data = await request.json()
            username_or_email = data.get("username") or data.get("email")
            password = data.get("password")
        except Exception:
            raise HTTPException(
                status_code=422, detail="Username/email and password required"
            )

    # Lookup by username OR email
    result = await db.execute(
        select(User).where(
            (User.username == username_or_email)
            | (User.email == username_or_email)
        )
    )
    user = result.scalars().first()

    # Handle invalid login
    if not user or not verify_password(password, user.hashed_password):
        await create_audit(
            db=db,
            user_id=None,
            ip_address=request.client.host if request.client else None,
            action_type="login_failed",
            method="POST",
            path=str(request.url.path),
            status_code=401,
            user_agent=request.headers.get("User-Agent"),
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Handle forced password change
    if getattr(user, "force_password_change", False):
        raise HTTPException(
            status_code=403,
            detail="Password reset required. Please change your password before logging in.",
        )

    # Generate JWT
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(
        data={"sub": str(user.id), "role": str(user.role)},
        expires_delta=access_token_expires,
    )

    # Audit successful login
    await create_audit(
        db=db,
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        action_type="login_success",
        method="POST",
        path=str(request.url.path),
        status_code=200,
        user_agent=request.headers.get("User-Agent"),
    )
    await db.flush()

    return {"access_token": token, "token_type": "bearer"}



# -----------------------------------------------------------
# CURRENT USER ENDPOINT
# -----------------------------------------------------------
@router.get("/users/me", response_model=UserOut)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


# -----------------------------------------------------------
# CHANGE PASSWORD ENDPOINT
# -----------------------------------------------------------
@router.post("/change-password", response_model=Token)
async def change_password(
    request: Request,  # ✅ Added safely for logging only
    payload: ChangePassword,
    db: AsyncSession = Depends(get_db),
):
    # 🔍 Find user by username or email
    q = await db.execute(
        select(User).where(
            (User.username == payload.username_or_email)
            | (User.email == payload.username_or_email)
        )
    )
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔐 Verify old password
    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Old password incorrect")

    # 🔄 Update password
    user.hashed_password = get_password_hash(payload.new_password)
    user.force_password_change = False
    user.last_password_changed = datetime.utcnow()

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # 🧾 Create audit log (with full metadata)
    try:
        await create_audit(
            db=db,
            user_id=str(user.id),
            ip_address=request.client.host if request.client else None,
            action_type="change_password",
            method=request.method,
            path=str(request.url.path),
            status_code=200,
            user_agent=request.headers.get("User-Agent"),
        )
    except Exception:
        # Silent fail — never block password change if audit log fails
        pass

    # 🔑 Auto-login after password change
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(
        data={"sub": str(user.id), "role": str(user.role)},
        expires_delta=access_token_expires,
    )

    return {"access_token": token, "token_type": "bearer"}