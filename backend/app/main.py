"""
Candid backend — FastAPI entrypoint.
Phase 3: core routing wired. Auth added in Phase 4.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .routers import (
    sources,
    analyses,
    reports,
    chat,
    dashboard,
    skill_gaps,
    assistant,
    account,
)

app = FastAPI(title="Candid API", version="0.1.0")

# CORS: allow frontend dev origin. Tighten in Phase 15 (Security Review) for prod.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sources.router)
app.include_router(analyses.router)
app.include_router(reports.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(skill_gaps.router)
app.include_router(assistant.router)
app.include_router(account.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "candid-backend"}
