from functools import lru_cache
from urllib.parse import urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


def _with_database(url: str, dbname: str) -> str:
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc, f"/{dbname}", parts.query, parts.fragment))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    DATABASE_NAME: str = "SDR-EMAIL"
    JWT_SECRET: str
    ENCRYPTION_KEY: str
    COOKIE_SECURE: bool = False
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    OPENAI_API_KEY: str
    OPENAI_ORG: str

    @property
    def admin_database_url(self) -> str:
        """Connection to the always-present maintenance DB, used only to create DATABASE_NAME if missing."""
        return _with_database(self.DATABASE_URL, "postgres")

    @property
    def sync_database_url(self) -> str:
        return _with_database(self.DATABASE_URL, self.DATABASE_NAME)

    @property
    def async_database_url(self) -> str:
        return self.sync_database_url.replace("postgresql://", "postgresql+asyncpg://", 1)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
