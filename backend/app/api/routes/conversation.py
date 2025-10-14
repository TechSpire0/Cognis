# app/api/routes/conversation.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from datetime import datetime
import uuid
from typing import List, Optional
from sqlalchemy import select
from app.db.deps import get_db
from app.core.security import get_current_user
from app.models.artifact import Artifact
from app.models.ufdrfile import UFDRFile
from app.models.user import User
from app.utils.ai_utils import build_forensic_prompt
from app.utils.embedding_utils import generate_embedding
from app.utils.chat_memory import load_session, save_session
from app.core.cache import (
    get_cached,
    set_cached,
    search_cache_key,
    llm_cache_key,
)
from app.core.llm import ask_llm_cached
from app.core.config import settings
from langchain.text_splitter import RecursiveCharacterTextSplitter


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask/{ufdr_file_id}")
async def ask_ai(
    ufdr_file_id: str,
    q: str = Query(..., description="Your question about this UFDR file"),
    top_k: int = Query(100, ge=1, le=300),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Handles UFDR-based forensic queries with conversational memory."""
    # 1️⃣ Validate UFDR
    result = await db.execute(select(UFDRFile).where(UFDRFile.id == ufdr_file_id))
    ufdr = result.scalars().first()
    if not ufdr:
        raise HTTPException(status_code=404, detail="UFDR not found")

    # -------------------------
    #  Load / create chat session
    # -------------------------
    # Use a deterministic session UUID so subsequent calls from the same user+ufdr pick up the same session.
    sess_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{ufdr_file_id}:{current_user.id}"))

    session_data = await load_session(sess_uuid, db)
    if not session_data:
        session_data = {
            "id": sess_uuid,
            "ufdr_file_id": ufdr_file_id,
            "user_id": str(current_user.id),
            "messages": [],
        }

    # Append user message to the session (timestamped)
    session_data["messages"].append(
        {"role": "user", "text": q, "ts": datetime.utcnow().isoformat()}
    )

    # -------------------------
    #  Search artifacts (existing logic)
    # -------------------------
    s_key = search_cache_key(ufdr_file_id, q)
    cached_search = await get_cached(s_key)
    artifacts: List[Artifact] = []
    context_snippets = ""

    if cached_search and isinstance(cached_search, dict) and "artifact_ids" in cached_search:
        artifact_ids = cached_search["artifact_ids"]
        res = await db.execute(select(Artifact).where(Artifact.id.in_(artifact_ids)))
        rows = {str(a.id): a for a in res.scalars().all()}
        artifacts = [rows[i] for i in artifact_ids if i in rows]
        context_snippets = cached_search.get("context_snippets", "")
    else:
        # embedding + vector search (keep your existing embedding + fallback code here)
        try:
            q_emb = generate_embedding(q)
            q_emb = [float(x) for x in q_emb] if q_emb else None
        except Exception as e:
            q_emb = None

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
            except Exception:
                artifacts = []

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
            # **Permanent safe fallback** (no test-only hack): provide a short, non-sensitive placeholder in context
            # so LLM can still answer sensibly. Keep it minimal and factual if used in prod.
            context_snippets = "[INFO] No matching artifacts found for this query."
        else:
            # Build context_snippets from artifacts (preserve your existing splitting logic)
            splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=300)
            for a in artifacts:
                if not a.extracted_text:
                    continue
                chunks = splitter.split_text(a.extracted_text)
                for chunk in chunks:
                    if len(context_snippets) + len(chunk) > 200000:
                        break
                    context_snippets += f"[{a.type}] {chunk}\n"

            # Cache search results
            try:
                artifact_ids = [str(a.id) for a in artifacts]
                ttl = getattr(settings, "SEARCH_CACHE_TTL", 60 * 60 * 24)
                await set_cached(
                    s_key,
                    {"artifact_ids": artifact_ids, "context_snippets": context_snippets},
                    expire_seconds=ttl,
                )
            except Exception:
                pass

    # -------------------------
    #  Build prompt including prior dialogue (session_data)
    # -------------------------
    prompt = build_forensic_prompt(q, context_snippets, prior_messages=session_data.get("messages", []))

    if not isinstance(prompt, str):
        raise RuntimeError("Prompt must be a string; got %r" % (type(prompt),))

    # 8️⃣ Query LLM (cached)
    ai_answer = await ask_llm_cached(str(ufdr_file_id), q, prompt)
    ai_answer = ai_answer.strip() if ai_answer else ""

    # Append assistant answer to session and persist
    session_data["messages"].append(
        {"role": "assistant", "text": ai_answer, "ts": datetime.utcnow().isoformat()}
    )
    try:
        await save_session(session_data, db)
    except Exception:
        # log but do not fail the request
        pass

    # Build a human-readable transcript (the 'response' field)
    transcript_lines = []
    for m in session_data.get("messages", []):
        # be defensive about expected keys
        r = m.get("role", "unknown")
        t = m.get("text", "")
        transcript_lines.append(f"{r}: {t}")
    full_transcript = "\n".join(transcript_lines)

    # Final response: maintain backward compatibility (answer) and add response + session_id
    return {
        "query": q,
        "ufdr_file_id": ufdr_file_id,
        "answer": ai_answer,
        "response": full_transcript,
        "session_id": session_data["id"],
        "context_count": len(artifacts),
        "context_ids": [str(a.id) for a in artifacts],
    }