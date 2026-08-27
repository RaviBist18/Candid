import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL", "MISSING")
key = os.environ.get("SUPABASE_SERVICE_KEY", "MISSING")

print(f"URL: '{url}'")
print(f"URL length: {len(url)}")
print(f"Key starts with: '{key[:15]}...'")
print(f"Key length: {len(key)}")
print(f"Key has leading/trailing whitespace: {key != key.strip()}")
print(f"Key has quotes: {chr(34) in key or chr(39) in key}")