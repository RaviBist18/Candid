"""
Phase 2 verification — confirms tables exist and are reachable via service key.
Run: python verify_schema.py  (from backend/ folder, venv activated, .env filled)
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_KEY"]
client = create_client(url, key)

TABLES = ["profiles", "sources", "analyses", "reports", "roadmap_items", "chat_messages"]

print("Checking tables...")
for table in TABLES:
    try:
        result = client.table(table).select("*", count="exact").limit(1).execute()
        print(f"  ✓ {table} — reachable, {result.count} row(s)")
    except Exception as e:
        print(f"  ✗ {table} — ERROR: {e}")

print("\nDone. All ✓ means Phase 2 schema applied correctly.")
