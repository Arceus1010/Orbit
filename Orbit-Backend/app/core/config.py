"""
Application configuration using Pydantic Settings.

This module provides centralized configuration management for the Orbit backend.
All settings are loaded from environment variables defined in the .env file.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Get the base directory (Orbit-Backend/)
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings are loaded from the .env file in the app directory.
    Pydantic automatically converts types and validates values.

    Attributes:
        DATABASE_URL: PostgreSQL database connection string
        SECRET_KEY: Secret key for JWT token signing
        ALGORITHM: JWT encoding algorithm (default: HS256)
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT token expiration time in minutes
        ANTHROPIC_API_KEY: API key for Anthropic Claude AI service
        APP_NAME: Application name
        APP_VERSION: Current version of the application
        DEBUG: Debug mode flag for development
    """

    # Database Configuration
    DATABASE_URL: str

    # Security Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI Service Configuration
    ANTHROPIC_API_KEY: str

    # Application Metadata
    APP_NAME: str = "Orbit"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Pydantic configuration using modern SettingsConfigDict
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / "app" / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore extra fields in .env file
    )


# Create a global settings instance
# This will be imported throughout the application
settings = Settings()
