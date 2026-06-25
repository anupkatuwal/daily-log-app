"""SQLAlchemy connection setup for the Neon (PostgreSQL) database."""
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Local dev only: load .env if present. override=False means a real host env
# var (Railway/Vercel) always takes precedence over the file.
load_dotenv(override=False)

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Copy .env.example to .env and paste your "
        "Neon connection string."
    )

# Neon requires SSL; only add sslmode for PostgreSQL connections.
_is_pg = DATABASE_URL.startswith(("postgresql", "postgres"))
if _is_pg and "sslmode=" not in DATABASE_URL:
    sep = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{sep}sslmode=require"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
