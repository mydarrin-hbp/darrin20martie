from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "My Darrin API"
    APP_VERSION: str = "0.2.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/mydarrin"

    # JWT Configuration
    JWT_SECRET: str  # No default - must be set via env
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Add startup validation
if settings.JWT_SECRET == "super-secret-change-me":
    raise ValueError("JWT_SECRET must be changed from default in production")