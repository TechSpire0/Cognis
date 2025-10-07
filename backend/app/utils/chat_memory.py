# backend/app/utils/chat_memory.py
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.chat_session import ChatSession
from app.core.cache import get_redis

CHAT_SESSION_TTL = 60 * 60 * 24 * 7  # 7 days in seconds


def redis_key(session_id: str) -> str:
    """Return a namespaced Redis key for chat session."""
    return f"chat:session:{session_id}"


async def load_session(session_id: str, db: Optional[AsyncSession] = None) -> Optional[Dict[str, Any]]:
    """Load a chat session from Redis; fallback to Postgres."""
    redis = get_redis()
    raw = await redis.get(redis_key(session_id))
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass

    # fallback to Postgres
    if not db:
        return None

    q = await db.execute(select(ChatSession).where(ChatSession.id == uuid.UUID(session_id)))
    obj = q.scalar_one_or_none()
    if not obj:
        return None

    return {
        "id": str(obj.id),
        "ufdr_file_id": str(obj.ufdr_file_id) if obj.ufdr_file_id else None,
        "user_id": str(obj.user_id) if obj.user_id else None,
        "messages": obj.messages or [],
    }


async def save_session(session_data: Dict[str, Any], db: Optional[AsyncSession] = None) -> None:
    """Save or update chat session in Redis and Postgres."""
    redis = get_redis()
    sid = session_data["id"]

    # Save to Redis
    await redis.set(redis_key(sid), json.dumps(session_data), ex=CHAT_SESSION_TTL)

    if not db:
        return

    # Upsert to Postgres
    q = await db.execute(select(ChatSession).where(ChatSession.id == uuid.UUID(sid)))
    existing = q.scalar_one_or_none()

    if existing:
        existing.messages = session_data.get("messages", [])
        existing.updated_at = datetime.utcnow()
        db.add(existing)
    else:
        new = ChatSession(
            id=uuid.UUID(sid),
            ufdr_file_id=uuid.UUID(session_data.get("ufdr_file_id")) if session_data.get("ufdr_file_id") else None,
            user_id=uuid.UUID(session_data.get("user_id")) if session_data.get("user_id") else None,
            messages=session_data.get("messages", []),
        )
        db.add(new)

    await db.commit()
