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
def get_report_by_analysis(
    analysis_id: str, user_id: str = Depends(get_current_user)
):
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

    _get_owned_report(item.data[0]["report_id"], user_id)  # ownership check

    result = (
        supabase.table("roadmap_items")
        .update({"is_checked": update.is_checked})
        .eq("id", item_id)
        .execute()
    )
    return result.data[0]
