"""
Supabase Cloud Database & Authentication Integration Module for Q-MolGen.
Connects Django backend and ML pipelines to Supabase PostgreSQL and Supabase Auth.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Add workspace root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load .env manually if dotenv is not imported
def _load_env_file():
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ:
                        os.environ[k] = v

_load_env_file()

# Supabase Credentials from Environment Variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://idhgdaovsxqfxlikimio.supabase.co")
SUPABASE_KEY = os.environ.get(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaGdkYW92c3hxZnhsaWtpbWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MDUzNjEsImV4cCI6MjEwNDA4MTM2MX0.yEoiox4rn2s3Gz4jy6VX4b3rNW55YP0Kso_R_FpNNbQ"
)
SUPABASE_SERVICE_ROLE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaGdkYW92c3hxZnhsaWtpbWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUwNTM2MSwiZXhwIjoyMTA0MDgxMzYxfQ.IKDyX8e-FqttFT0gjvQaopqnh15w6yI_sw8qmodJWKQ"
)
SUPABASE_DB_URI = os.environ.get("SUPABASE_DB_URI", "")

_supabase_client = None


def get_supabase_client():
    """
    Returns an initialized Supabase Python client connected to live Supabase Cloud.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    try:
        from supabase import create_client
        if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
            # Use service role key if available for administrative DB operations, or anon key
            key_to_use = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY
            _supabase_client = create_client(SUPABASE_URL, key_to_use)
            logger.info(f"Connected to Supabase Project: {SUPABASE_URL}")
            return _supabase_client
    except Exception as e:
        logger.warning(f"Supabase client connection notice: {e}")

    return None


def get_database_config() -> Dict:
    """
    Returns database connection summary, project ID, and status.
    """
    client = get_supabase_client()
    is_connected = client is not None

    return {
        "engine": "PostgreSQL 15 (Supabase Cloud)" if is_connected else "SQLite (Local Embedded / Fallback)",
        "supabase_connected": is_connected,
        "project_id": "idhgdaovsxqfxlikimio",
        "supabase_url": SUPABASE_URL,
        "region": "ap-south-1 (AWS Mumbai)",
        "auth_provider": "Supabase GoTrue Auth",
        "tables": ["profiles", "candidates", "experiments", "models", "audit_logs"],
        "connection_pooler": "Transaction Mode (Port 6543 / 5432)",
    }


if __name__ == "__main__":
    print("Testing Supabase Cloud Connection...")
    client = get_supabase_client()
    if client:
        print(f"SUCCESS: Connected to live Supabase Project at {SUPABASE_URL}")
        config = get_database_config()
        print(f"Config: {config}")
    else:
        print("Failed to initialize Supabase client.")
