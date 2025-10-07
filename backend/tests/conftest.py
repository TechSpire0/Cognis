import os
import sys
import asyncio
import uuid
import io
import zipfile
from pathlib import Path

import pytest
import pytest_asyncio
import httpx
from httpx import AsyncClient
from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import select, text

# ---------------------------------------------------
# 🧭 Path setup so `app` imports work when running tests
# ---------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BACKEND_DIR = os.path.join(REPO_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ---------------------------------------------------
# 🧩 Import project modules
# ---------------------------------------------------
from app.main import app
from app.db.base import Base
from app.db.session import engine as app_engine, SessionLocal as AppSessionLocal
from app.db.deps import get_db as app_get_db
from app.models.user import User
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile
from app.models.case import Case
from app.models.auditlog import AuditLog
from app.core.security import get_password_hash, create_access_token

# ---------------------------------------------------
# ⚙️ Test DB setup
# ---------------------------------------------------
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///./test_cognis.db"
)

# New test engine + session (no pool for isolation)
engine = create_async_engine(TEST_DATABASE_URL, future=True, poolclass=NullPool)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    """
    Create all tables once per test session.
    Ensures pgvector extension is installed before create_all().
    """
    import app.models.user
    import app.models.case
    import app.models.ufdrfile
    import app.models.artifact
    import app.models.auditlog

    async with engine.begin() as conn:
        try:
            if engine.dialect.name == "postgresql":
                await conn.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector;")
        except Exception as e:
            print(f"[WARN] Could not create pgvector extension: {e}")

        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
async def clean_db(db_session):
    """Truncate key tables between tests."""
    tables = ["artifacts", "ufdr_files", "cases", "users", "audit_logs"]
    for table in tables:
        try:
            await db_session.execute(text(f"DELETE FROM {table}"))
        except Exception:
            pass
    await db_session.commit()


@pytest_asyncio.fixture()
async def db_session():
    """Yield a fresh AsyncSession for each test."""
    async with AsyncSessionLocal() as session:
        yield session


# ---------------------------------------------------
# 🔧 Unify app and test database sessions
# ---------------------------------------------------
from app import db as app_db

async def _override_get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Force FastAPI app + dependencies to use test engine/session
app_db.session.engine = engine
app_db.session.SessionLocal = AsyncSessionLocal
app_db.deps.get_db = _override_get_db

# Apply dependency override globally
app.dependency_overrides.clear()
app.dependency_overrides[app_get_db] = _override_get_db


@pytest_asyncio.fixture()
async def client():
    """Create async HTTP client bound to FastAPI app."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


# ---------------------------------------------------
# 🔐 Auth-related fixtures
# ---------------------------------------------------
@pytest_asyncio.fixture()
async def admin_user(db_session: AsyncSession):
    result = await db_session.execute(select(User).where(User.username == "test_admin"))
    user = result.scalars().first()
    if user:
        return user

    admin = User(
        username="test_admin",
        email="admin@example.test",
        hashed_password=get_password_hash("password"),
        role="admin",
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture()
async def investigator_user(db_session: AsyncSession):
    result = await db_session.execute(select(User).where(User.username == "investigator"))
    user = result.scalars().first()
    if user:
        return user

    inv = User(
        username="investigator",
        email="inv@example.test",
        hashed_password=get_password_hash("password"),
        role="investigator",
    )
    db_session.add(inv)
    await db_session.commit()
    await db_session.refresh(inv)
    return inv


@pytest_asyncio.fixture()
async def admin_token(admin_user):
    return create_access_token({"sub": str(admin_user.id), "role": admin_user.role})


@pytest_asyncio.fixture()
async def investigator_token(investigator_user):
    return create_access_token({"sub": str(investigator_user.id), "role": investigator_user.role})


# ---------------------------------------------------
# 📦 Sample UFDR ZIP fixture
# ---------------------------------------------------
@pytest_asyncio.fixture()
async def sample_zip_bytes():
    mem = io.BytesIO()
    with zipfile.ZipFile(mem, mode="w") as zf:
        zf.writestr("contacts.csv", "name,phone\nAlice,12345\nBob,67890\n")
        zf.writestr("notes.txt", "owner: Alice\nphone: 12345\n")
    mem.seek(0)
    return mem.read()


# ---------------------------------------------------
# 🧠 UFDR Upload Fixture (ensures artifacts exist)
# ---------------------------------------------------
@pytest_asyncio.fixture()
async def uploaded_ufdr(client: AsyncClient, admin_token: str, db_session: AsyncSession, monkeypatch, sample_zip_bytes):
    """Upload fake UFDR ZIP and ensure artifacts exist for chat endpoint."""
    import app.utils.embedding_utils as emb_mod
    monkeypatch.setattr(emb_mod, "generate_embedding", lambda text: None, raising=False)

    files = {"file": ("sample.zip", sample_zip_bytes, "application/zip")}
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.post("/api/v1/ufdr/upload", headers=headers, files=files)
    assert resp.status_code == 200, f"UFDR upload failed: {resp.text}"
    ufdr_data = resp.json()
    ufdr_id = ufdr_data["id"]

    # Guarantee dummy artifacts for chat search
    result = await db_session.execute(select(Artifact).where(Artifact.ufdr_file_id == ufdr_id))
    artifacts = result.scalars().all()

    if not artifacts:
        dummy_artifacts = [
            Artifact(
                id=str(uuid.uuid4()),
                ufdr_file_id=ufdr_id,
                type="note",
                extracted_text="owner: Alice\nphone: 12345\nDummy artifact for tests.",
            ),
            Artifact(
                id=str(uuid.uuid4()),
                ufdr_file_id=ufdr_id,
                type="contact",
                extracted_text="Alice 12345 contact stored in phone.",
            ),
        ]
        db_session.add_all(dummy_artifacts)
        await db_session.commit()

        # 🔹 Explicitly close and reopen session to ensure visibility
        await db_session.close()
        new_session = AsyncSessionLocal()
        await new_session.commit()
        await new_session.close()



    return ufdr_data
