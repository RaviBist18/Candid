"""
Single shared Supabase client, using service_role/sb_secret key —
bypasses RLS. Safe here since backend enforces user scoping itself
(added properly in Phase 4 once auth exists).
"""
from supabase import create_client, Client
from .config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
