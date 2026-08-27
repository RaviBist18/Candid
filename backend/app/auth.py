"""
Auth dependency — verifies the Supabase session JWT sent by the frontend
in the Authorization header, and returns the real authenticated user_id.

Every protected route uses: user_id: str = Depends(get_current_user)
This REPLACES the temporary `user_id: str` query param used in Phase 3.
"""
from fastapi import Header, HTTPException
from .db import supabase


def get_current_user(authorization: str = Header(...)) -> str:
    """
    Expects header: Authorization: Bearer <supabase_access_token>
    Verifies the token against Supabase Auth (network call — acceptable
    at <100 user scale per locked Phase 0.5 decision; revisit caching
    in Phase 14 if scale changes).
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_response.user.id
