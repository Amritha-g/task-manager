import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "FastAPI Task Manager" 
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-for-local")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    #while deploying on vercel i have to be careful of env 
    if os.getenv("VERCEL"):
        DATABASE_URL: str = "sqlite:////tmp/taskmanager.db"
    else:
        DATABASE_URL: str = "sqlite:///./taskmanager.db"

settings = Settings()
