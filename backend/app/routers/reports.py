"""
Reports endpoints — fetch a completed analysis's gap report and roadmap.

SECURITY NOTE: backend uses the service_role/sb_secret key, which BYPASSES
RLS entirely. That means ownership checks must happen explicitly in this
code — RLS alone does not protect these routes. Each handler below verifies
the underlying analysis belongs to the requesting user before returning
anything.
"""

from fastapi import APIRouter, HTTPException, Depends
from ..db import supabase
from ..models import ReportOut, RoadmapItemOut, RoadmapItemUpdate
from ..auth import get_current_user
from ..ats_scoring import compute_ats_score

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_owned_report_by_analysis(analysis_id: str, user_id: str) -> dict:
    analysis = (
        supabase.table("analyses")
        .select("id")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = (
        supabase.table("reports").select("*").eq("analysis_id", analysis_id).execute()
    )
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return report.data[0]


def _get_owned_report(report_id: str, user_id: str) -> dict:
    report = supabase.table("reports").select("*").eq("id", report_id).execute()
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    analysis = (
        supabase.table("analyses")
        .select("id")
        .eq("id", report.data[0]["analysis_id"])
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return report.data[0]


@router.get("/by-analysis/{analysis_id}", response_model=ReportOut)
def get_report_by_analysis(analysis_id: str, user_id: str = Depends(get_current_user)):
    return _get_owned_report_by_analysis(analysis_id, user_id)


@router.get("/{report_id}/roadmap", response_model=list[RoadmapItemOut])
def get_roadmap_items(report_id: str, user_id: str = Depends(get_current_user)):
    _get_owned_report(report_id, user_id)  # ownership check, raises 404 if not owned
    result = (
        supabase.table("roadmap_items")
        .select("*")
        .eq("report_id", report_id)
        .order("order_index")
        .execute()
    )
    return result.data


@router.patch("/roadmap-items/{item_id}", response_model=RoadmapItemOut)
def update_roadmap_item(
    item_id: str, update: RoadmapItemUpdate, user_id: str = Depends(get_current_user)
):
    item = supabase.table("roadmap_items").select("*").eq("id", item_id).execute()
    if not item.data:
        raise HTTPException(status_code=404, detail="Roadmap item not found")
    target = item.data[0]

    _get_owned_report(target["report_id"], user_id)

    siblings = (
        supabase.table("roadmap_items")
        .select("id, order_index, is_checked")
        .eq("report_id", target["report_id"])
        .eq("project_title", target["project_title"])
        .order("order_index")
        .execute()
    ).data

    target_position = next(i for i, s in enumerate(siblings) if s["id"] == item_id)
    highest_checked_position = -1
    for i, s in enumerate(siblings):
        if s["is_checked"]:
            highest_checked_position = i

    if update.is_checked:
        if target_position != highest_checked_position + 1:
            raise HTTPException(
                status_code=400,
                detail="Complete roadmap items in order — check the next step first.",
            )
    else:
        if target_position != highest_checked_position:
            raise HTTPException(
                status_code=400,
                detail="You can only uncheck the most recently completed step.",
            )

    result = (
        supabase.table("roadmap_items")
        .update({"is_checked": update.is_checked})
        .eq("id", item_id)
        .execute()
    )
    return result.data[0]


@router.get("/by-analysis/{analysis_id}/ats-score")
def get_ats_score(analysis_id: str, user_id: str = Depends(get_current_user)):
    analysis = (
        supabase.table("analyses")
        .select("id, job_description, resume_text")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    a = analysis.data[0]

    report = (
        supabase.table("reports")
        .select("ats_score, ats_breakdown")
        .eq("analysis_id", analysis_id)
        .execute()
    )

    if report.data and report.data[0].get("ats_breakdown"):
        result = report.data[0]["ats_breakdown"]
    else:
        # Fallback for older rows saved before ats_breakdown existed
        result = compute_ats_score(a["resume_text"], a["job_description"])

    result["analysis_id"] = analysis_id
    jd = a["job_description"]
    result["job_title"] = jd[:60] + "..." if len(jd) > 60 else jd
    return result


@router.get("/by-analysis/{analysis_id}/roadmap-projects")
def get_roadmap_projects(analysis_id: str, user_id: str = Depends(get_current_user)):
    analysis = (
        supabase.table("analyses")
        .select("id, job_description")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
    a = analysis.data[0]

    report = (
        supabase.table("reports").select("id").eq("analysis_id", analysis_id).execute()
    )
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")
    report_id = report.data[0]["id"]

    items = (
        supabase.table("roadmap_items")
        .select("project_title, is_checked")
        .eq("report_id", report_id)
        .execute()
    ).data

    projects: dict[str, dict] = {}
    for item in items:
        title = item["project_title"]
        entry = projects.setdefault(title, {"total": 0, "done": 0})
        entry["total"] += 1
        if item["is_checked"]:
            entry["done"] += 1

    jd = a["job_description"] or ""
    job_title = jd[:60] + ("..." if len(jd) > 60 else "")

    return {
        "analysis_id": analysis_id,
        "job_title": job_title,
        "projects": [
            {"project_title": title, "done_items": s["done"], "total_items": s["total"]}
            for title, s in projects.items()
        ],
    }


@router.get("/by-analysis/{analysis_id}/roadmap-items")
def get_roadmap_items_by_project(
    analysis_id: str, project_title: str, user_id: str = Depends(get_current_user)
):
    analysis = (
        supabase.table("analyses")
        .select("id")
        .eq("id", analysis_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not analysis.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = (
        supabase.table("reports").select("id").eq("analysis_id", analysis_id).execute()
    )
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")
    report_id = report.data[0]["id"]

    items = (
        supabase.table("roadmap_items")
        .select("*")
        .eq("report_id", report_id)
        .eq("project_title", project_title)
        .order("order_index")
        .execute()
    ).data

    if not items:
        raise HTTPException(
            status_code=404, detail="Roadmap not found for this project"
        )

    return {"analysis_id": analysis_id, "project_title": project_title, "items": items}


@router.get("/roadmaps-summary")
def get_roadmaps_summary(user_id: str = Depends(get_current_user)):
    analyses = (
        supabase.table("analyses")
        .select("id, job_description, created_at")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .execute()
    ).data

    if not analyses:
        return []

    analysis_ids = [a["id"] for a in analyses]
    reports = (
        supabase.table("reports")
        .select("id, analysis_id")
        .in_("analysis_id", analysis_ids)
        .execute()
    ).data
    report_to_analysis = {r["id"]: r["analysis_id"] for r in reports}
    report_ids = list(report_to_analysis.keys())

    if not report_ids:
        return []

    items = (
        supabase.table("roadmap_items")
        .select("report_id, project_title, is_checked")
        .in_("report_id", report_ids)
        .execute()
    ).data

    agg: dict[str, dict] = {}
    for item in items:
        analysis_id = report_to_analysis.get(item["report_id"])
        if not analysis_id:
            continue
        entry = agg.setdefault(analysis_id, {"projects": set(), "done": 0, "total": 0})
        entry["projects"].add(item["project_title"])
        entry["total"] += 1
        if item["is_checked"]:
            entry["done"] += 1

    results = []
    for a in analyses:
        stats = agg.get(a["id"])
        if not stats:
            continue
        jd = a["job_description"] or ""
        results.append(
            {
                "id": a["id"],
                "job_title": jd[:60] + ("..." if len(jd) > 60 else ""),
                "project_count": len(stats["projects"]),
                "done_items": stats["done"],
                "total_items": stats["total"],
                "updated_at": a["created_at"],
            }
        )

    results.sort(key=lambda r: r["updated_at"], reverse=True)
    return results
