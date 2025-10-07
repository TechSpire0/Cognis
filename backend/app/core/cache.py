# backend/app/core/cache.py
import json
import hashlib
from typing import Any, Optional, List
import redis.asyncio as redis
from app.core.config import settings

_redis: Optional[redis.Redis] = None

def _hash_query(q: str) -> str:
    return hashlib.sha256(q.encode("utf-8")).hexdigest()

def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis

async def get_cached(key: str) -> Optional[Any]:
    r = get_redis()
    raw = await r.get(key)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None

async def set_cached(key: str, value: Any, expire_seconds: int | None = None) -> None:
    r = get_redis()
    dump = json.dumps(value)
    if expire_seconds:
        await r.set(key, dump, ex=expire_seconds)
    else:
        await r.set(key, dump)

async def del_pattern(pattern: str) -> None:
    r = get_redis()
    async for key in r.scan_iter(match=pattern):
        await r.delete(key)

def llm_cache_key(ufdr_id: str, query: str) -> str:
    return f"llm:{ufdr_id}:{_hash_query(query)}"

def search_cache_key(ufdr_id: str, query: str) -> str:
    return f"search:{ufdr_id}:{_hash_query(query)}"
