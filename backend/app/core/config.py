import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend or root directory
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "NovaWorks AI Project Manager"
    API_V1_STR: str = "/api"
    
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(backend_dir / "novaworks.db"))
    
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "novaworks-super-secure-jwt-secret-key-infinity-hack-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    AI_API_KEY: str = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-2.5-flash")

settings = Settings()
