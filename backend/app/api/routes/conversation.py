from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile
from app.models.user import User
from app.utils.ai_utils import build_forensic_prompt
from app.core.llm import ask_llm_cached
from app.utils.embedding_utils import generate_embedding
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.cache import get_cached, set_cached, search_cache_key
from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["Conversation"])


@router.post("/ask/{ufdr_file_id}")
async def ask_ai(
    ufdr_file_id: str,
    q: str = Query(..., description="Your question about this UFDR file"),
    top_k: int = Query(100, ge=1, le=300),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Handles UFDR-based forensic queries with Redis caching + Gemini."""
    # 1️⃣ Validate UFDR
    result = await db.execute(select(UFDRFile).where(UFDRFile.id == ufdr_file_id))
    ufdr = result.scalars().first()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR not found")

    # 2️⃣ Check Redis search cache
    s_key = search_cache_key(ufdr_file_id, q)
    cached_search = await get_cached(s_key)
    artifacts: List[Artifact] = []
    context_snippets = ""

    # 3️⃣ If cached, reuse
    if cached_search and isinstance(cached_search, dict) and "artifact_ids" in cached_search:
        artifact_ids = cached_search["artifact_ids"]
        res = await db.execute(select(Artifact).where(Artifact.id.in_(artifact_ids)))
        rows = {str(a.id): a for a in res.scalars().all()}
        artifacts = [rows[i] for i in artifact_ids if i in rows]
        context_snippets = cached_search.get("context_snippets", "")

    else:
        # 4️⃣ Generate embedding
        try:
            q_emb = generate_embedding(q)
            q_emb = [float(x) for x in q_emb] if q_emb else None
        except Exception as e:
            print(f"[WARN] Embedding failed: {e}")
            q_emb = None

        # 5️⃣ Vector similarity search
        if q_emb:
            try:
                stmt = (
                    select(Artifact)
                    .where(Artifact.ufdr_file_id == ufdr_file_id)
                    .where(Artifact.embedding.isnot(None))
                    .order_by(Artifact.embedding.l2_distance(q_emb))
                    .limit(top_k)
                )
                res = await db.execute(stmt)
                artifacts = res.scalars().all()
            except Exception as e:
                print(f"[ERROR] Vector search failed: {e}")

        # 6️⃣ Fallback search
        if not artifacts:
            q_terms = [t.strip() for t in q.split() if t.strip()]
            if q_terms:
                conds = [Artifact.extracted_text.ilike(f"%{t}%") for t in q_terms]
                stmt = (
                    select(Artifact)
                    .where(Artifact.ufdr_file_id == ufdr_file_id)
                    .where(or_(*conds))
                    .limit(top_k)
                )
            else:
                stmt = select(Artifact).where(Artifact.ufdr_file_id == ufdr_file_id).limit(top_k)
            res = await db.execute(stmt)
            artifacts = res.scalars().all()

        if not artifacts:
            raise HTTPException(status_code=404, detail="No relevant artifacts found")

        # 7️⃣ Build context
        splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=300)
        for a in artifacts:
            if not a.extracted_text:
                continue
            chunks = splitter.split_text(a.extracted_text)
            for chunk in chunks:
                if len(context_snippets) + len(chunk) > 200000:
                    break
                context_snippets += f"[{a.type}] {chunk}\n"

        # Cache the search results
        artifact_ids = [str(a.id) for a in artifacts]
        try:
            ttl = getattr(settings, "SEARCH_CACHE_TTL", 60 * 60 * 24)
            await set_cached(
                s_key,
                {"artifact_ids": artifact_ids, "context_snippets": context_snippets},
                expire_seconds=ttl,
            )
        except Exception:
            pass

    # 8️⃣ Build prompt & query Gemini (cached)
    prompt = build_forensic_prompt(q, context_snippets)
    ai_answer = await ask_llm_cached(str(ufdr_file_id), q, prompt)

    return {
        "query": q,
        "ufdr_file_id": ufdr_file_id,
        "answer": ai_answer.strip(),
        "context_count": len(artifacts),
        "context_ids": [str(a.id) for a in artifacts],
    }
