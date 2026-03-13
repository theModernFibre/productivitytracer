from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "B2B Productivity API"
    secret_key: str = "change-me-in-production-use-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    database_url: str = "sqlite+aiosqlite:///./productivity.db"

    class Config:
        env_file = ".env"


settings = Settings()
