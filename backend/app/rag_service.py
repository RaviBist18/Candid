"""
Retrieval layer — embeds a query, fetches top-k similar chunks from corpus_chunks.
Isolated from ai_service.py — must be testable standalone before wiring in.
"""

import httpx
from .db import supabase
from .config import settings

HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"


class RetrievalError(Exception):
    pass


def embed_query(text: str, timeout: float = 8.0) -> list[float]:
    try:
        resp = httpx.post(
            HF_API_URL,
            headers={"Authorization": f"Bearer {settings.HF_API_KEY}"},
            json={"inputs": text, "options": {"wait_for_model": False}},
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp.json()
    except (httpx.HTTPError, httpx.TimeoutException) as e:
        raise RetrievalError(f"Embedding failed: {e}")


def retrieve(query: str, source_type: str, top_k: int = 5) -> list[str]:
    """
    Returns list of chunk content strings. Raises RetrievalError on failure —
    caller (ai_service.py) must catch this and fall back to ungrounded analysis.
    """
    embedding = embed_query(query)

    result = supabase.rpc(
        "match_corpus_chunks",
        {
            "query_embedding": embedding,
            "match_source_type": source_type,
            "match_count": top_k,
        },
    ).execute()

    return [row["content"] for row in result.data]
