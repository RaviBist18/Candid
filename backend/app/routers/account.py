from fastapi import APIRouter, Depends
from ..db import supabase
from ..auth import get_current_user

router = APIRouter()


@router.delete("/api/account")
def delete_account(user_id: str = Depends(get_current_user)):
    supabase.table("analyses").delete().eq("user_id", user_id).execute()
    supabase.table("sources").delete().eq("user_id", user_id).execute()
    supabase.table("profiles").delete().eq("user_id", user_id).execute()

    supabase.auth.admin.delete_user(user_id)

    return {"success": True}
