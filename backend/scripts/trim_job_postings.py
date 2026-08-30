"""
One-time script: trim raw Kaggle Indian job market xlsx down to relevant
tech-role postings, output as CSV matching ingest_corpus.py's expected format
(column name: description).
"""

import pandas as pd

SRC_PATH = r"C:\Users\viratkohli\Downloads\archive\indian-job-market-dataset-2025.xlsx"
OUT_PATH = "data/job_postings.csv"
MAX_ROWS = 500

TECH_KEYWORDS = [
    "software engineer",
    "backend developer",
    "frontend developer",
    "full stack developer",
    "full-stack developer",
    "python developer",
    "java developer",
    "javascript developer",
    "react developer",
    "node developer",
    "data scientist",
    "data analyst",
    "devops engineer",
    "machine learning engineer",
    "ml engineer",
    "sde",
    "web developer",
    "software developer",
]

df = pd.read_excel(SRC_PATH)
print(f"Total rows: {len(df)}")

import re

df["title_lower"] = df["title"].astype(str).str.lower()


def is_real_tech_role(title: str) -> bool:
    if any(
        bad in title
        for bad in [
            "voice process",
            "non voice",
            "bpo",
            "chat process",
            "email chat",
            "ctc for",
        ]
    ):
        return False
    return any(re.search(rf"\b{re.escape(kw)}\b", title) for kw in TECH_KEYWORDS)


mask = df["title_lower"].apply(is_real_tech_role)
tech_df = df[mask].copy()
print(f"Tech-role rows: {len(tech_df)}")

import re as re_html


def strip_html(text: str) -> str:
    text = re_html.sub(r"<[^>]+>", " ", str(text))
    text = re_html.sub(r"\s+", " ", text).strip()
    return text


tech_df = tech_df.dropna(subset=["jobDescription"])
tech_df["jobDescription"] = tech_df["jobDescription"].apply(strip_html)
tech_df = tech_df[tech_df["jobDescription"].str.len() > 50]
tech_df = tech_df.drop_duplicates(subset=["jobDescription"])
print(f"After dedup/empty filter: {len(tech_df)}")

tech_df = tech_df.head(MAX_ROWS)
tech_df = tech_df.rename(columns={"jobDescription": "description"})

import os

os.makedirs("data", exist_ok=True)
tech_df[["title", "description"]].to_csv(OUT_PATH, index=False)
print(f"Saved {len(tech_df)} rows to {OUT_PATH}")
