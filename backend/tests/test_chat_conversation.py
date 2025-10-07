# backend/tests/test_chat_conversation.py
import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
from app.main import app
from app.db.session import SessionLocal
from app.models.ufdrfile import UFDRFile
from app.models.artifact import Artifact


pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def db_session():
    """Provide a clean async DB session."""
    async with SessionLocal() as session:
        yield session


from httpx import AsyncClient, ASGITransport

@pytest_asyncio.fixture
async def test_client():
    """Create a test HTTP client for FastAPI."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client



@pytest.fixture(autouse=True)
def mock_llm(monkeypatch):
    """
    Mock ask_llm_cached to simulate contextual LLM responses.
    Tracks calls to ensure previous context is passed.
    """
    call_log = []

    async def fake_llm(ufdr_id: str, query: str, prompt: str):
        call_log.append({"ufdr_id": ufdr_id, "query": query, "prompt": prompt})
        if "Where does he live" in query:
            # If this is the follow-up, verify context is present
            assert "Who is Ravi Sharma" in prompt, "Previous turn missing from prompt!"
            return "Ravi Sharma lives in Mumbai."
        return "Ravi Sharma is a known associate in the case."

    monkeypatch.setattr("app.core.llm.ask_llm_cached", fake_llm)
    return call_log


from app.models.artifact import Artifact
import uuid

@pytest_asyncio.fixture()
async def sample_ufdr(db_session):
    """Create a UFDRFile with dummy artifacts for chat context."""
    from app.models.ufdrfile import UFDRFile
    ufdr = UFDRFile(filename="test.ufdr", storage_path="/tmp/test.ufdr")
    db_session.add(ufdr)
    await db_session.commit()
    await db_session.refresh(ufdr)

    # Add one dummy artifact mentioning Ravi Sharma
    artifact = Artifact(
        id=str(uuid.uuid4()),
        ufdr_file_id=ufdr.id,
        type="note",
        extracted_text="Ravi Sharma travelled to Mumbai last month for a business trip.",
    )
    db_session.add(artifact)
    await db_session.commit()
    return ufdr



@pytest.mark.asyncio
async def test_multi_turn_chat_context(test_client, sample_ufdr, mock_llm, admin_token):
    """Ensure multi-turn memory is preserved between chat turns."""
    ufdr_id = str(sample_ufdr.id)

    headers = {"Authorization": f"Bearer {admin_token}"}

    # First question
    q1 = "Who is Ravi Sharma?"
    resp1 = await test_client.post(
        f"/api/v1/chat/ask/{ufdr_id}", params={"q": q1}, headers=headers
    )
    assert resp1.status_code == status.HTTP_200_OK, resp1.text

    # Second question (should retain context)
    q2 = "Where did he travel last month?"
    resp2 = await test_client.post(
        f"/api/v1/chat/ask/{ufdr_id}", params={"q": q2}, headers=headers
    )
    assert resp2.status_code == status.HTTP_200_OK, resp2.text

    data1, data2 = resp1.json(), resp2.json()
    assert "answer" in data2
    assert "Mumbai" in data2["answer"]
    assert "Ravi" in data2["response"]
