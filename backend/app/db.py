"""
Supabase client — service_role/sb_secret key, bypasses RLS.

`get_supabase()` returns a fresh client per call. `supabase` is a thin
proxy that creates a new client on every attribute access (e.g. every
`.table(...)` call) — this avoids the old singleton going stale after
being idle, which was causing intermittent
`httpx.RemoteProtocolError: Server disconnected` errors under
uvicorn's threadpool.
"""

from supabase import create_client, Client
from .config import settings


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


class _SupabaseProxy:
    """Delegates every attribute access to a freshly created client."""

    def __getattr__(self, name):
        return getattr(get_supabase(), name)


supabase = _SupabaseProxy()
