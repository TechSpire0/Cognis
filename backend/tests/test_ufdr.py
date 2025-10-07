# backend/tests/test_ufdr.py
import pytest
from sqlalchemy import select
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile


@pytest.mark.asyncio
async def test_ufdr_upload_and_parsing(client, admin_token, monkeypatch, sample_zip_bytes, db_session):
    # patch embedding to avoid external model call during upload
    try:
        monkeypatch.setattr("app.utils.embedding_utils.generate_embedding", lambda text: None)
    except Exception:
        import app.utils.embedding_utils as emb_mod
        emb_mod.generate_embedding = lambda text: None

    files = {"file": ("sample.zip", sample_zip_bytes, "application/zip")}
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.post("/api/v1/ufdr/upload", headers=headers, files=files)
    assert resp.status_code == 200, resp.text
    data = resp.json()

    assert "artifacts_parsed" in data
    assert int(data["artifacts_parsed"]) >= 1

    ufdr_id = data["id"]

    # verify UFDR row exists
    res = await db_session.execute(select(UFDRFile).where(UFDRFile.id == ufdr_id))
    uf = res.scalars().first()
    assert uf is not None
    assert uf.filename is not None

    # verify at least one artifact created
    res = await db_session.execute(select(Artifact).where(Artifact.ufdr_file_id == ufdr_id))
    arts = res.scalars().all()
    assert len(arts) >= 1
