# app/utils/embedding_utils.py
from sentence_transformers import SentenceTransformer
from app.core.config import settings

_model = None
def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model

def generate_embedding(text: str) -> list[float]:
    if not text:
        return []
    vec = _get_model().encode(text, convert_to_numpy=False)  # ensure not numpy
    # If convert_to_numpy returns numpy, convert to list:
    try:
        return [float(x) for x in vec]
    except Exception:
        # as fallback if model returns numpy
        return vec.tolist() if hasattr(vec, "tolist") else list(map(float, vec))
