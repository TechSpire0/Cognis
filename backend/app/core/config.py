# backend/app/core/config.py
from pydantic_settings import BaseSettings


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

    # ---------- Misc ----------
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

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


settings = Settings()
