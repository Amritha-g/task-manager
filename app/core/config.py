import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "FastAPI Task Manager"
    # Do NOT hardcode secrets! Loading from environment variable.
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-for-local")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # If running on Vercel, the file system is read-only except for /tmp
    if os.getenv("VERCEL"):
        DATABASE_URL: str = "sqlite:////tmp/taskmanager.db"
    else:
        DATABASE_URL: str = "sqlite:///./taskmanager.db"

settings = Settings()
