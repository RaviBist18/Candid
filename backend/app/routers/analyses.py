"""
Analyses endpoints — trigger a new gap-analysis run, check status, list history.
user_id now comes from the verified session token (Phase 4).
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from ..db import supabase
from ..models import AnalysisCreate, AnalysisOut
from ..auth import get_current_user
from ..ai_service import run_gap_analysis

router = APIRouter(prefix="/analyses", tags=["analyses"])


@router.get("", response_model=list[AnalysisOut])
def list_analyses(user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("", response_model=AnalysisOut)
def create_analysis(
    analysis: AnalysisCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
):
    payload = {
        "user_id": user_id,
        "job_description": analysis.job_description,
        "status": "pending",
    }
    result = supabase.table("analyses").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create analysis")

    analysis_id = result.data[0]["id"]
    background_tasks.add_task(run_gap_analysis, analysis_id, user_id)

    return result.data[0]


@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis(analysis_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result.data[0]
