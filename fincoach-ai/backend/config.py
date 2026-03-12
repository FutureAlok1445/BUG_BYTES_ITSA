"""
Application configuration using Pydantic BaseSettings.
All values loaded from environment variables / .env file.
"""
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    """FinCoach AI application settings."""

    # --- API Keys ---
    GROQ_API_KEY: str = ""
    ELASTIC_NODE: str = ""
    ELASTIC_PASSWORD: str = ""

    # --- App Settings ---
    USER_ID: str = "user_001"
    ALLOWED_ORIGINS: str = "*"
    RATE_LIMIT_PER_MINUTE: int = 30
    MAX_CHAT_MESSAGE_LENGTH: int = 500
    REPORT_SECRET_KEY: str = "fincoach-default-secret-change-me"
    ENVIRONMENT: str = "development"

    # --- Derived ---
    @property
    def origins_list(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


def get_settings() -> Settings:
    """Create and validate application settings."""
    settings = Settings()

    warnings = []
    if not settings.GROQ_API_KEY:
        warnings.append("GROQ_API_KEY is missing — AI features will use fallback responses")
    if not settings.ELASTIC_NODE:
        warnings.append("ELASTIC_NODE is missing — database will use mock data")
    if not settings.ELASTIC_PASSWORD:
        warnings.append("ELASTIC_PASSWORD is missing — database will use mock data")

    for w in warnings:
        print(f"⚠️  CONFIG WARNING: {w}")

    return settings


# Singleton settings instance
settings = get_settings()
