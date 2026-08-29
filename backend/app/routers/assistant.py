"""
Career assistant endpoints — general career Q&A, not grounded to a specific
report. History persisted per user in assistant_messages.
"""

from fastapi import APIRouter, Depends

from ..db import supabase
from ..models import AssistantMessageCreate, AssistantMessageOut
from ..auth import get_current_user
from ..ai_service import generate_assistant_reply

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.get("/messages", response_model=list[AssistantMessageOut])
def get_messages(user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("assistant_messages")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )
    return result.data


@router.post("/messages", response_model=AssistantMessageOut)
def post_message(
    message: AssistantMessageCreate, user_id: str = Depends(get_current_user)
):
    supabase.table("assistant_messages").insert(
        {"user_id": user_id, "role": "user", "content": message.content}
    ).execute()

    reply = generate_assistant_reply(user_id)

    result = (
        supabase.table("assistant_messages")
        .insert({"user_id": user_id, "role": "assistant", "content": reply})
        .execute()
    )
    return result.data[0]


@router.delete("/messages")
def clear_messages(user_id: str = Depends(get_current_user)):
    supabase.table("assistant_messages").delete().eq("user_id", user_id).execute()
    return {"cleared": True}
