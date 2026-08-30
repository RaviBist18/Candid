"""
One-time corpus ingestion — job postings + ATS rules → embeddings → Supabase.
Run manually: python -m scripts.ingest_corpus
Not imported by the running app.
"""

import time
import httpx
from app.db import supabase
from app.config import settings

HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{HF_MODEL}/pipeline/feature-extraction"


def embed_text(text: str, retries: int = 3) -> list[float]:
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


def ingest_ats_rules():
    rules = [
        "Avoid multi-column layouts — ATS parsers read left-to-right, top-to-bottom and can scramble two-column resumes into unreadable order.",
        "Do not put contact information inside a header or footer — many ATS parsers skip these sections entirely.",
        "Avoid tables for structuring content — table cells often get parsed out of order or dropped.",
        "Do not embed text inside images or graphics — ATS cannot read text rendered as an image.",
        "Use standard section headings like 'Experience', 'Education', 'Skills' — unconventional headings may not be recognized.",
        "Avoid text boxes — content inside text boxes is frequently skipped by parsers entirely.",
        "Use standard fonts (Arial, Calibri, Times New Roman) — decorative fonts can cause character misreads.",
        "Save as .docx or standard PDF (not a scanned image PDF) — scanned PDFs have no extractable text layer.",
        "Avoid special characters and symbols as bullet points — use plain hyphens or standard bullets.",
        "Spell out acronyms at least once (e.g. 'Search Engine Optimization (SEO)') — some ATS keyword matching is literal.",
        "Keep consistent date formatting (e.g. MM/YYYY) — inconsistent formats can break chronological parsing.",
        "Avoid nested bullet points more than one level deep — deep nesting often flattens incorrectly.",
        "Do not rely on color alone to convey hierarchy or emphasis — parsers ignore color entirely.",
        "Name the file professionally (e.g. FirstName_LastName_Resume.pdf) — some systems index by filename.",
        "Include a skills section with exact keyword matches from the job description — many ATS rank by keyword overlap, not synonyms.",
        "Avoid headers/footers for section content, page numbers are fine there — but never critical resume content.",
        "Do not use uncommon file formats (.pages, .odt) — stick to .pdf or .docx for maximum compatibility.",
        "List job titles and company names in plain text, not inside graphic elements — parsers extract from plain text only.",
    ]
    rows = []
    for i, rule in enumerate(rules):
        print(f"Embedding ATS rule {i+1}/{len(rules)}...")
        embedding = embed_text(rule)
        rows.append(
            {"source_type": "ats_rule", "content": rule, "embedding": embedding}
        )
        time.sleep(0.5)  # gentle on free-tier rate limits

    supabase.table("corpus_chunks").insert(rows).execute()
    print(f"Inserted {len(rows)} ATS rule chunks.")


def ingest_job_postings(csv_path: str, text_column: str, limit: int = 500):
    import csv

    rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= limit:
                break
            text = row.get(text_column, "").strip()
            if not text or len(text) < 50:
                continue
            print(f"Embedding job posting {i+1}/{limit}...")
            embedding = embed_text(text[:2000])  # cap length, avoid huge payloads
            rows.append(
                {
                    "source_type": "job_posting",
                    "content": text[:2000],
                    "embedding": embedding,
                }
            )
            time.sleep(0.5)

            if len(rows) % 50 == 0:
                supabase.table("corpus_chunks").insert(rows).execute()
                print(f"Flushed {len(rows)} rows to Supabase.")
                rows = []

    if rows:
        supabase.table("corpus_chunks").insert(rows).execute()
        print(f"Flushed final {len(rows)} rows.")


if __name__ == "__main__":
    print("Ingesting ATS rules...")
    ingest_ats_rules()

    # print("Ingesting job postings...")
    # ingest_job_postings(
    #     csv_path="data/job_postings.csv", text_column="description", limit=500
    # )

    print("Done.")
