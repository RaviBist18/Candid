"""
Pydantic models for request/response validation.
Keep these in sync with the DB schema in migrations/001_initial_schema.sql.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# ── Sources ─────────────────────────────────────────────
SourceType = Literal["github", "resume", "linkedin", "portfolio"]


class SourceCreate(BaseModel):
    source_type: SourceType
    raw_data: dict = Field(default_factory=dict)


class SourceOut(BaseModel):
    id: str
    user_id: str
    source_type: SourceType
    raw_data: dict
    updated_at: datetime


# ── Analyses ────────────────────────────────────────────
class AnalysisCreate(BaseModel):
    job_description: str = Field(..., min_length=10)
    resume_text: str = Field(..., min_length=10)
    portfolio_url: Optional[str] = None


class AnalysisOut(BaseModel):
    id: str
    user_id: str
    job_description: str
    resume_text: str
    portfolio_url: Optional[str] = None
    status: Literal["pending", "processing", "completed", "failed"]
    error_message: Optional[str] = None
    created_at: datetime


# ── Reports ─────────────────────────────────────────────
class ReportOut(BaseModel):
    id: str
    analysis_id: str
    missing_projects: list
    skill_gaps: list
    ats_issues: list
    created_at: datetime


# ── Roadmap items ───────────────────────────────────────
class RoadmapItemUpdate(BaseModel):
    is_checked: bool


class RoadmapItemOut(BaseModel):
    id: str
    report_id: str
    project_title: str
    title: str
    description: Optional[str] = None
    is_checked: bool
    order_index: int


# ── Chat ────────────────────────────────────────────────
class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class ChatMessageOut(BaseModel):
    id: str
    report_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime
