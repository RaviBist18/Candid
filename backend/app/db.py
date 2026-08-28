"""
Supabase client — service_role/sb_secret key, bypasses RLS.
`get_supabase()` returns a fresh client (safe under concurrent
threadpool requests). `supabase` module-level var kept for
backward compat with routers not yet migrated — TODO: migrate
all routers to get_supabase() and remove this.
"""

from supabase import create_client, Client
from .config import settings


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


supabase: Client = get_supabase()
