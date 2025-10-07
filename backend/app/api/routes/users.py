from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRead
from app.core.security import decode_access_token
from app.core.security import oauth2_scheme
from jose import jwt, JWTError

from app.db.deps import get_db
from app.core.config import settings
from app.core.security import oauth2_scheme  # your token scheme




router = APIRouter(prefix="/users", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),     
    token: str = Depends(oauth2_scheme)   
):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

@router.get("/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    return {"token_received": token}

@router.get("/investigators", summary="List all investigators (Admin only)")
async def list_investigators(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: View all investigators with IDs for case assignment."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view investigators.",
        )

    stmt = select(User).where(User.role == "investigator").order_by(User.username.asc())
    res = await db.execute(stmt)
    investigators = res.scalars().all()

    return [
        {
            "id": str(u.id),
            "username": u.username,
            "email": u.email,
            "role": u.role,
        }
        for u in investigators
    ]