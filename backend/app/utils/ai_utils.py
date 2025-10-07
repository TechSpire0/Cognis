# app/utils/ai_utils.py

from typing import List, Optional, Dict

def build_forensic_prompt(
    q: str,
    context: str,
    prior_messages: Optional[List[Dict]] = None
) -> str:
    """
    Build a forensic-aware prompt for the LLM.
    Includes short system message, evidence context, and prior conversation.
    """
    system = "You are a forensic AI assistant analyzing UFDR data. Be precise and concise."

    history_text = ""
    if prior_messages:
        for msg in prior_messages[-10:]:
            role = msg.get("role", "user").capitalize()
            text = msg.get("text", "")
            if text:
                history_text += f"{role}: {text}\n"

    return (
        f"{system}\n\n"
        f"Context:\n{context}\n\n"
        f"Conversation:\n{history_text}\n"
        f"User: {q}\nAssistant:"
    )