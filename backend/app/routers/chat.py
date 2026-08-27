"""
Chat endpoints — follow-up conversation grounded in a specific report.
Ownership verified explicitly since service_role bypasses RLS (see reports.py note).
"""

from fastapi import APIRouter, HTTPException, Depends
from ..db import supabase
from ..models import ChatMessageCreate, ChatMessageOut
from ..auth import get_current_user
from ..ai_service import generate_chat_reply

router = APIRouter(prefix="/reports/{report_id}/chat", tags=["chat"])


def _verify_report_ownership(report_id: str, user_id: str) -> None:
    report = (
        supabase.table("reports").select("analysis_id").eq("id", report_id).execute()
    )
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


@router.get("", response_model=list[ChatMessageOut])
def list_messages(report_id: str, user_id: str = Depends(get_current_user)):
    _verify_report_ownership(report_id, user_id)
    result = (
        supabase.table("chat_messages")
        .select("*")
        .eq("report_id", report_id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("", response_model=ChatMessageOut)
def post_message(
    report_id: str,
    message: ChatMessageCreate,
    user_id: str = Depends(get_current_user),
):
    _verify_report_ownership(report_id, user_id)
    payload = {"report_id": report_id, "role": "user", "content": message.content}
    result = supabase.table("chat_messages").insert(payload).execute()

    reply_text = generate_chat_reply(report_id)
    supabase.table("chat_messages").insert(
        {"report_id": report_id, "role": "assistant", "content": reply_text}
    ).execute()

    return result.data[0]
