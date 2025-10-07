# app/db/deps.py

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import SessionLocal   # correct import

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:   # use SessionLocal, not async_session
        yield session
