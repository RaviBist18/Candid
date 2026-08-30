"""
Supabase client — service_role/sb_secret key, bypasses RLS.

True singleton, created once at process startup. If a call fails due to
a stale/dropped connection (the original RemoteProtocolError issue), the
proxy catches it, recreates the client once, and retries — so we get
one-time client-creation cost instead of paying it on every request,
while still self-healing from idle disconnects.
"""

from supabase import create_client, Client
from httpx import RemoteProtocolError
from .config import settings

_client: Client | None = None


def _new_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_supabase() -> Client:
    global _client
    if _client is None:
        _client = _new_client()
    return _client


class _SupabaseProxy:
    """Delegates to the singleton client. On RemoteProtocolError (stale
    connection), recreates the client once and retries the same call."""

    def __getattr__(self, name):
        attr = getattr(get_supabase(), name)
        if not callable(attr):
            return attr

        def wrapper(*args, **kwargs):
            global _client
            try:
                return attr(*args, **kwargs)
            except RemoteProtocolError:
                _client = _new_client()
                return getattr(_client, name)(*args, **kwargs)

        return wrapper


supabase = _SupabaseProxy()
