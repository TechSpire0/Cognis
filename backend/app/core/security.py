# backend/app/core/security.py
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Callable
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if len(plain_password.encode("utf-8")) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 60)))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, getattr(settings, "JWT_SECRET", "dev-secret"), algorithm=getattr(settings, "JWT_ALGORITHM", "HS256"))
    return token

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, getattr(settings, "JWT_SECRET", "dev-secret"), algorithms=[getattr(settings, "JWT_ALGORITHM", "HS256")])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials") from e

# dependency that returns current User model instance (async)
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    print("Token received:", token)
    print("Decoded payload:", payload)
    return user
