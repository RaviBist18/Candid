"""
Retrieval — embeds a JD, pulls top-k matching job_posting + ats_rule chunks
from Supabase via match_corpus_chunks RPC. Used inside /analyze pipeline.
"""

import time
import httpx
from app.db import supabase
from app.config import settings

HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"


def embed_text(text: str, retries: int = 3) -> list[float]:
    """Must match ingest_corpus.py exactly — same model, same endpoint, same dims."""
    for attempt in range(retries):
        try:
            resp = httpx.post(
                HF_API_URL,
                headers={"Authorization": f"Bearer {settings.HF_API_KEY}"},
                json={"inputs": text, "options": {"wait_for_model": True}},
                timeout=30.0,
            )
            resp.raise_for_status()
            return resp.json()
        except (httpx.HTTPError, httpx.TimeoutException) as e:
            wait = 2**attempt
            print(
                f"Embed failed (attempt {attempt+1}/{retries}): {e}. Retrying in {wait}s..."
            )
            time.sleep(wait)
    raise RuntimeError(f"Failed to embed after {retries} attempts: {text[:50]}...")


def retrieve_grounding_context(jd_text: str, job_k: int = 8, ats_k: int = 5) -> dict:
    jd_embedding = embed_text(
        jd_text[:2000]
    )  # same cap as ingest, consistent truncation

    job_result = supabase.rpc(
        "match_corpus_chunks",
        {
            "query_embedding": jd_embedding,
            "match_source_type": "job_posting",
            "match_count": job_k,
        },
    ).execute()

    ats_result = supabase.rpc(
        "match_corpus_chunks",
        {
            "query_embedding": jd_embedding,
            "match_source_type": "ats_rule",
            "match_count": ats_k,
        },
    ).execute()

    return {
        "job_postings": [row["content"] for row in job_result.data],
        "ats_rules": [row["content"] for row in ats_result.data],
    }
