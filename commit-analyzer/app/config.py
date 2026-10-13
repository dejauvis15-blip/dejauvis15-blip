import os

from dotenv import load_dotenv

load_dotenv()


def _bool(value, default=False):
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Config:
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") or None
    GITHUB_API_URL = os.getenv("GITHUB_API_URL", "https://api.github.com")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB = os.getenv("MONGO_DB", "commit_analyzer")
    SYNC_CRON = os.getenv("SYNC_CRON", "0 * * * *")
    SCHEDULER_ENABLED = _bool(os.getenv("SCHEDULER_ENABLED"), default=True)
    INITIAL_SYNC_DAYS = int(os.getenv("INITIAL_SYNC_DAYS", "365"))
    TESTING = False
