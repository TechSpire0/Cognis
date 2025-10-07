#app/db/session.py

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True,
)

# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

# Dependency (for routes & security)
async def get_db():
    async with SessionLocal() as session:
        yield session
