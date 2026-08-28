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
        "resume_text": analysis.resume_text,
        "portfolio_url": analysis.portfolio_url,
        "status": "pending",
    }
    result = supabase.table("analyses").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create analysis")

    analysis_id = result.data[0]["id"]
    background_tasks.add_task(run_gap_analysis, analysis_id, user_id)

    return result.data[0]


@router.get("/roadmap-progress")
def get_roadmap_progress(user_id: str = Depends(get_current_user)):
    analyses = supabase.table("analyses").select("id").eq("user_id", user_id).execute()
    analysis_ids = [a["id"] for a in analyses.data]
    if not analysis_ids:
        return {}

    reports = (
        supabase.table("reports")
        .select("id, analysis_id")
        .in_("analysis_id", analysis_ids)
        .execute()
    )
    report_to_analysis = {r["id"]: r["analysis_id"] for r in reports.data}
    report_ids = list(report_to_analysis.keys())
    if not report_ids:
        return {}

    items = (
        supabase.table("roadmap_items")
        .select("report_id, is_checked")
        .in_("report_id", report_ids)
        .execute()
    )

    progress: dict[str, dict[str, int]] = {}
    for item in items.data:
        analysis_id = report_to_analysis.get(item["report_id"])
        if not analysis_id:
            continue
        entry = progress.setdefault(analysis_id, {"done": 0, "total": 0})
        entry["total"] += 1
        if item["is_checked"]:
            entry["done"] += 1

    return progress


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


@router.delete("/{analysis_id}")
def delete_analysis(analysis_id: str, user_id: str = Depends(get_current_user)):
    existing = (
        supabase.table("analyses")
        .select("id")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    try:
        supabase.table("analyses").delete().eq("id", analysis_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed — this analysis may have a linked report blocking it: {e}",
        )
    return {"deleted": True, "id": analysis_id}
