# app/utils/ai_utils.py

def build_forensic_prompt(query: str, context: str) -> str:
    return f"""
You are a digital forensic analyst assistant.

The following are artifacts extracted from a UFDR file (mobile device extraction). 
Use them to answer the investigator's question as accurately and concisely as possible.

Context:
{context}

Question:
{query}

Instructions:
- Summarize findings clearly.
- List call or message data in structured bullet points if applicable.
- If data isn't sufficient, explicitly say so.
"""
