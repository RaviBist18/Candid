"""
Sources endpoints — connect/update/list GitHub, resume, LinkedIn, portfolio data.
user_id now comes from the verified session token (Phase 4), not a query param.
"""
from fastapi import APIRouter, HTTPException, Depends
from ..db import supabase
from ..models import SourceCreate, SourceOut
from ..auth import get_current_user

router = APIRouter(prefix="/sources", tags=["sources"])


@router.get("", response_model=list[SourceOut])
def list_sources(user_id: str = Depends(get_current_user)):
    result = supabase.table("sources").select("*").eq("user_id", user_id).execute()
    return result.data


@router.put("", response_model=SourceOut)
def upsert_source(source: SourceCreate, user_id: str = Depends(get_current_user)):
    """Create or update a source — one row per (user_id, source_type)."""
    payload = {
        "user_id": user_id,
        "source_type": source.source_type,
        "raw_data": source.raw_data,
    }
    result = (
        supabase.table("sources")
        .upsert(payload, on_conflict="user_id,source_type")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save source")
    return result.data[0]


@router.delete("/{source_type}")
def delete_source(source_type: str, user_id: str = Depends(get_current_user)):
    supabase.table("sources").delete().eq("user_id", user_id).eq(
        "source_type", source_type
    ).execute()
    return {"status": "deleted"}
