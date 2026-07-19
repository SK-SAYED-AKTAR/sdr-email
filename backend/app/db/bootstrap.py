import psycopg2

from app.core.config import settings


def ensure_database_exists() -> None:
    """Creates the DATABASE_NAME database on the target Postgres server if it doesn't exist yet."""
    conn = psycopg2.connect(settings.admin_database_url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (settings.DATABASE_NAME,))
            if not cur.fetchone():
                cur.execute(f'CREATE DATABASE "{settings.DATABASE_NAME}"')
    finally:
        conn.close()
