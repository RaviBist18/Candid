"""
Skill-gaps endpoints — list view (aggregated across analyses) and detail view
(single analysis). Reads from reports.skill_gaps jsonb, no new table needed.
"""

from fastapi import APIRouter, HTTPException, Depends

from ..db import supabase
from ..auth import get_current_user

router = APIRouter(prefix="/skill-gaps", tags=["skill-gaps"])


@router.get("")
def list_skill_gaps(user_id: str = Depends(get_current_user)):
    analyses = (
        supabase.table("analyses")
        .select("id, job_title")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .execute()
    )
    if not analyses.data:
        return []

    analysis_ids = [a["id"] for a in analyses.data]
    title_by_analysis = {a["id"]: a["job_title"] for a in analyses.data}

    reports = (
        supabase.table("reports")
        .select("analysis_id, skill_gaps, created_at")
        .in_("analysis_id", analysis_ids)
        .execute()
    )

    items = []
    for r in reports.data:
        gaps = r.get("skill_gaps") or []
        if not gaps:
            continue
        critical_count = sum(1 for g in gaps if g.get("severity") == "critical")
        items.append(
            {
                "id": r["analysis_id"],
                "job_title": title_by_analysis.get(r["analysis_id"], "Untitled"),
                "critical_count": critical_count,
                "total_count": len(gaps),
                "updated_at": r.get("created_at"),
            }
        )

    items.sort(key=lambda x: x["updated_at"], reverse=True)
    return items


@router.get("/{analysis_id}")
def get_skill_gaps_detail(analysis_id: str, user_id: str = Depends(get_current_user)):
    analysis = (
        supabase.table("analyses")
        .select("id, job_title")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = (
        supabase.table("reports")
        .select("skill_gaps")
        .eq("analysis_id", analysis_id)
        .execute()
    )
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "analysis_id": analysis_id,
        "job_title": analysis.data[0]["job_title"],
        "skill_gaps": report.data[0].get("skill_gaps") or [],
    }
