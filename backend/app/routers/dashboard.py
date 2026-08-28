"""
Dashboard endpoints — lightweight aggregate views for the dashboard page.
No new AI calls here by design (cheap/rule-based insight, see project notes).
"""

import random
from collections import Counter

from fastapi import APIRouter, Depends

from ..db import supabase
from ..models import InsightOut
from ..auth import get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/insight", response_model=InsightOut)
def get_dashboard_insight(user_id: str = Depends(get_current_user)):
    analyses = (
        supabase.table("analyses")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .order("created_at", desc=True)
        .limit(3)
        .execute()
    )
    analysis_ids = [a["id"] for a in analyses.data]

    if not analysis_ids:
        return {
            "insight": "Complete your first analysis to unlock personalized insights here.",
            "has_analyses": False,
        }

    reports = (
        supabase.table("reports")
        .select("skill_gaps, missing_projects, ats_issues")
        .in_("analysis_id", analysis_ids)
        .execute()
    )

    candidates = []

    # Signal 1: recurring skill gap
    all_gaps = [
        g["skill"]
        for r in reports.data
        for g in (r.get("skill_gaps") or [])
        if isinstance(g, dict) and g.get("skill")
    ]
    if all_gaps:
        top_gap, count = Counter(all_gaps).most_common(1)[0]
        if count >= 2:
            candidates.append(
                f"Your last {len(analysis_ids)} analyses show a recurring gap: "
                f"{top_gap}. Consider prioritizing that next."
            )

    # Signal 2: a suggested project
    for r in reports.data:
        for p in r.get("missing_projects") or []:
            if isinstance(p, dict) and p.get("title"):
                candidates.append(
                    f"Consider building: {p['title']} — it would strengthen "
                    f"your profile against recent target roles."
                )
                break
        if candidates:
            break

    # Signal 3: an ATS issue to fix
    for r in reports.data:
        issues = r.get("ats_issues") or []
        if issues:
            issue = issues[0]
            fix = issue.get("fix") if isinstance(issue, dict) else str(issue)
            issue_text = fix[0] if isinstance(fix, list) and fix else fix
            if issue_text:
                candidates.append(f"ATS check: {issue_text}")
                break

    if not candidates:
        return {
            "insight": "No standout signals yet — run more analyses to surface trends.",
            "has_analyses": True,
        }

    return {"insight": random.choice(candidates), "has_analyses": True}


@router.get("/stats")
def get_dashboard_stats(user_id: str = Depends(get_current_user)):
    all_analyses = (
        supabase.table("analyses")
        .select("id, created_at")
        .eq("user_id", user_id)
        .execute()
    )

    total = len(all_analyses.data)

    now = datetime.now(timezone.utc)
    this_month = sum(
        1
        for a in all_analyses.data
        if datetime.fromisoformat(a["created_at"]).month == now.month
        and datetime.fromisoformat(a["created_at"]).year == now.year
    )

    Fmost_recent = None
    if all_analyses.data:
        latest = max(all_analyses.data, key=lambda a: a["created_at"])
        analysis = (
            supabase.table("analyses")
            .select("id, created_at, job_description")
            .eq("id", latest["id"])
            .single()
            .execute()
        )

        try:
            report = (
                supabase.table("reports")
                .select("ats_score")
                .eq("analysis_id", latest["id"])
                .single()
                .execute()
            )
            ats_score = report.data.get("ats_score") if report.data else None
        except Exception:
            ats_score = None

        jd = analysis.data.get("job_description") or ""
        role_display = jd[:60] + ("..." if len(jd) > 60 else "")

        most_recent = {
            "id": analysis.data["id"],
            "role": role_display,
            "created_at": analysis.data["created_at"],
            "ats_score": ats_score,
        }

    return {
        "total_analyses": total,
        "total_analyses_this_month": this_month,
        "most_recent": most_recent,
    }
