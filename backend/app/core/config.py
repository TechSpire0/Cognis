# backend/app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Centralized configuration for Cognis backend.
    Supports environment-based overrides via .env
    """

    # ---------- Database ----------
    DATABASE_URL: str  # postgresql+asyncpg://user:password@localhost/dbname

    # ---------- Redis ----------
    REDIS_URL: str = "redis://localhost:6379/0"

    # ---------- Local Storage ----------
    LOCAL_STORAGE_PATH: str = "./data/uploads"

    # ---------- JWT ----------
    JWT_SECRET: str = "supersecret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ---------- AI / Embeddings ----------
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # ---------- Gemini ----------
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # ---------- MinIO ----------
    MINIO_ENDPOINT: str = Field(default="127.0.0.1:9000")
    MINIO_ACCESS_KEY: str = Field(default="minioadmin")
    MINIO_SECRET_KEY: str = Field(default="minioadmin")
    MINIO_BUCKET_NAME: str = Field(default="cognis-ufdr")
    MINIO_SECURE: bool = Field(default=False)

    # ---------- Misc ----------
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    CHAT_USE_REDIS: bool = True
    CHAT_SESSION_TTL_SECONDS: int = 60 * 60 * 24 * 7  # 7 days

    # ✅ Backward compatibility aliases (for old routes)
    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET

    @property
    def ALGORITHM(self) -> str:
        return self.JWT_ALGORITHM

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # ✅ Avoid ValidationError for future additions


settings = Settings()
