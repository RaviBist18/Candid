"""
Centralized env/config access. Import settings from here instead of
scattering os.getenv() calls across the codebase.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SUPABASE_URL: str = os.environ["SUPABASE_URL"]
    SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
    GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")
    HF_API_KEY: str = os.environ.get("HF_API_KEY", "")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    GITHUB_CLIENT_ID: str = os.environ.get("GITHUB_CLIENT_ID", "")
    GITHUB_CLIENT_SECRET: str = os.environ.get("GITHUB_CLIENT_SECRET", "")


settings = Settings()
