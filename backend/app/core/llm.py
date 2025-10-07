# app/core/llm.py
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# --- Load configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")  # ✅ use 2.5 flash explicitly

if not GEMINI_API_KEY:
    raise ValueError("❌ Gemini API key not set. Please export GEMINI_API_KEY in your environment.")

# --- Initialize Gemini-2.5-Flash ---
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    api_key=GEMINI_API_KEY,
    temperature=0.3,
    max_output_tokens=8192,   # ✅ higher cap (8k+ tokens output)
)

# --- Async wrapper ---
async def generate_response(prompt: str) -> str:
    """Generate a clean response from Gemini 2.5 Flash."""
    try:
        msg = HumanMessage(content=prompt)
        result = await llm.ainvoke([msg])

        if hasattr(result, "content"):
            if isinstance(result.content, str):
                return result.content.strip()
            if isinstance(result.content, list):
                return " ".join([c for c in result.content if isinstance(c, str)]).strip()
        if isinstance(result, str):
            return result.strip()

        print(f"[WARN] Unexpected Gemini output: {result}")
        return "[No response received from Gemini]"
    except Exception as e:
        print(f"[LLM ERROR] {e}")
        return f"[Error communicating with Gemini: {e}]"
