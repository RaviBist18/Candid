"""
Auth dependency — verifies the Supabase session JWT locally via JWKS
(ES256), no network call to Supabase per request. JWKS cached 1hr.
"""

import os
import time
import httpx
import jwt
from fastapi import Header, HTTPException

SUPABASE_URL = os.environ["SUPABASE_URL"]
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

_jwks_cache: dict = {}
_jwks_cached_at: float = 0
JWKS_CACHE_TTL = 3600


def _get_jwks() -> dict:
    global _jwks_cache, _jwks_cached_at
    now = time.time()
    if _jwks_cache and (now - _jwks_cached_at) < JWKS_CACHE_TTL:
        return _jwks_cache
    resp = httpx.get(JWKS_URL, timeout=10)
    resp.raise_for_status()
    _jwks_cache = resp.json()
    _jwks_cached_at = now
    return _jwks_cache


def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header"
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        headers = jwt.get_unverified_header(token)
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    jwks = _get_jwks()
    kid = headers.get("kid")
    key = None
    for k in jwks.get("keys", []):
        if k.get("kid") == kid:
            key = jwt.algorithms.ECAlgorithm.from_jwk(k)
            break
    if not key:
        raise HTTPException(status_code=401, detail="Signing key not found")

    try:
        payload = jwt.decode(
            token, key, algorithms=["ES256"], options={"verify_aud": False}
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    return payload["sub"]
