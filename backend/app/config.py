"""
Application configuration loaded from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "ClearCollect AI"
    API_VERSION: str = "v1"

    # CORS
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "*"
    ).split(",")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clearcollect.db")

    # Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))

    # Gemini API (optional)
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")

    # AI API Keys (optional)
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    def validate(self):
        required = ["DATABASE_URL", "SECRET_KEY"]
        missing = [k for k in required if not getattr(self, k)]
        if missing:
            raise ValueError(f"Missing required env vars: {missing}")


settings = Settings()
if settings.ENVIRONMENT == "production":
    settings.validate()
