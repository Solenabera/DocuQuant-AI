from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application Information
    PROJECT_NAME: str = "DocuQuant AI"
    DESCRIPTION: str = "Enterprise Financial PDF Extraction & Self-Correcting Multi-Agent Audit Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # CORS Settings
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            clean = v.strip()
            if clean.startswith("[") and clean.endswith("]"):
                import json
                try:
                    parsed = json.loads(clean)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
                clean = clean.strip("[]")
            return [i.strip().strip("'\"") for i in clean.split(",") if i.strip().strip("'\"")]
        elif isinstance(v, (list, tuple, set)):
            return [str(i).strip() for i in v if str(i).strip()]
        return []

    # Message Broker & Backend (Redis & Celery)
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI & LLM Settings
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    DEFAULT_LLM_PROVIDER: str = "google"

    # LangGraph Multi-Agent Configuration
    CIRCUIT_BREAKER_MAX_REVISIONS: int = 3
    AUDITOR_MAX_RETRIES: int = 3

    # File Storage
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent.parent / "uploads"
    MAX_FILE_SIZE_MB: int = 50

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()

# Ensure uploads directory is created at a deterministic location
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

