# backend/tests/test_chat_memory.py
import pytest
import pytest_asyncio
import uuid
from app.utils.chat_memory import save_session, load_session
from app.db.session import SessionLocal


pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def db_session():
    """Provide a clean async DB session for each test."""
    async with SessionLocal() as session:
        yield session


class DummyRedis:
    """Simple in-memory Redis mock for testing."""
    def __init__(self):
        self.store = {}
    async def get(self, k):
        return self.store.get(k)
    async def set(self, k, v, ex=None):
        self.store[k] = v


@pytest.fixture(autouse=True)
def patch_redis(monkeypatch):
    """Replace real Redis client with a dummy mock."""
    dummy = DummyRedis()
    monkeypatch.setattr("app.utils.chat_memory.get_redis", lambda: dummy)
    return dummy


async def test_save_and_load_session(db_session):
    """Verify session is persisted and can be reloaded."""
    sid = str(uuid.uuid4())
    data = {
        "id": sid,
        "ufdr_file_id": None,
        "user_id": None,
        "messages": [{"role": "user", "text": "hello world", "ts": "now"}],
    }

    await save_session(data, db_session)
    loaded = await load_session(sid, db_session)

    assert loaded is not None
    assert loaded["id"] == sid
    assert loaded["messages"][0]["text"] == "hello world"


async def test_load_from_postgres_when_redis_empty(db_session, patch_redis):
    """Confirm fallback to Postgres works when Redis returns None."""
    sid = str(uuid.uuid4())
    data = {
        "id": sid,
        "ufdr_file_id": None,
        "user_id": None,
        "messages": [{"role": "user", "text": "from database only", "ts": "now"}],
    }

    await save_session(data, db_session)
    patch_redis.store.clear()  # simulate Redis eviction

    reloaded = await load_session(sid, db_session)
    assert reloaded["messages"][0]["text"] == "from database only"
