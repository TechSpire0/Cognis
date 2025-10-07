# backend/app/core/llm.py
import os
import hashlib
from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.core.cache import get_cached, set_cached, llm_cache_key

# Validate config
if not settings.GEMINI_API_KEY:
    raise ValueError("❌ Gemini API key not set. Please set GEMINI_API_KEY in environment/config.")

llm = ChatGoogleGenerativeAI(
    model=settings.GEMINI_MODEL,
    api_key=settings.GEMINI_API_KEY,
    temperature=0.3,
    max_output_tokens=8192,
)

async def _generate_response_raw(prompt: str) -> str:
    """Low-level LLM call (no cache)."""
    try:
        msg = HumanMessage(content=prompt)
        result = await llm.ainvoke([msg])
        # handle multiple possible shapes
        if hasattr(result, "content"):
            if isinstance(result.content, str):
                return result.content.strip()
            if isinstance(result.content, list):
                return " ".join([c for c in result.content if isinstance(c, str)]).strip()
        if isinstance(result, str):
            return result.strip()
        return "[No response received from Gemini]"
    except Exception as e:
        # keep error visible but return a controlled message
        return f"[Error communicating with Gemini: {e}]"

async def ask_llm_cached(ufdr_id: str, query: str, prompt: str) -> str:
    """Check Redis for an LLM cached response, otherwise call Gemini and cache."""
    key = llm_cache_key(ufdr_id, query)
    cached = await get_cached(key)
    if cached and isinstance(cached, dict) and "response" in cached:
        return cached["response"]

    resp = await _generate_response_raw(prompt)
    # store with TTL from settings
    ttl = getattr(settings, "LLM_CACHE_TTL", 60 * 60 * 24 * 7)  # default 7 days
    try:
        await set_cached(key, {"response": resp}, expire_seconds=ttl)
    except Exception:
        pass
    return resp
