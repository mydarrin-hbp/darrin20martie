from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "My Darrin API"
    APP_VERSION: str = "0.2.0"
    API_V1_PREFIX: str = "/api/v1"
    BACKOFFICE_CONTACT_NAME: str | None = "My Darrin Backoffice"
    BACKOFFICE_CONTACT_EMAIL: str | None = None
    BACKOFFICE_CONTACT_PHONE: str | None = None
    BACKOFFICE_CONTACT_WHATSAPP: str | None = None
    BACKOFFICE_CONTACT_NOTE: str | None = None

    DATABASE_URL: str = (
        "postgresql+psycopg://mydarrin_app:YOUR_CLOUD_SQL_PASSWORD@34.155.95.43:5432/mydarrin?sslmode=require"
    )

    # JWT Configuration
    JWT_SECRET: str  # No default - must be set via env
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    GOOGLE_API_KEY: str | None = None
    MAPS_API_KEY: str | None = None
    GOOGLE_MAPS_GEOCODING_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    VATSENSE_API_KEY: str | None = None
    VATSENSE_API_URL: str = "https://api.vatsense.com/1.0/rates"
    REST_COUNTRIES_API_URL: str = "https://restcountries.com/v3.1/alpha"
    GOOGLE_MAPS_GEOCODING_API_URL: str = "https://maps.googleapis.com/maps/api/geocode/json"
    BACKEND_CORS_ORIGINS: str = "http://127.0.0.1:3000,http://localhost:3000,http://172.30.176.1:3000"
    ENABLE_BASIC_AUTH_GATE: bool = True
    BASIC_AUTH_GATE_USERNAME: str = "ownergate"
    BASIC_AUTH_GATE_PASSWORD: str = "CHANGE_ME"
    ATTACHMENTS_STORAGE_DIR: str = "storage/attachments"
    ATTACHMENTS_STORAGE_BACKEND: str = "gcs"
    GCS_ATTACHMENTS_BUCKET: str | None = "run-sources-mydarrin-platform-europe-west9"
    GCS_ATTACHMENTS_PREFIX: str = "attachments"
    SIGNUP_SMS_CODE_TTL_MINUTES: int = 10
    SMS_DEBUG_DELIVERY: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Add startup validation
if settings.JWT_SECRET == "super-secret-change-me":
    raise ValueError("JWT_SECRET must be changed from default in production")
