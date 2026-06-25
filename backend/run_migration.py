"""Run the SQL migration against DATABASE_URL — no psql binary needed.

Usage:
    cd backend
    source .venv/bin/activate
    python run_migration.py            # runs migrations/001_init.sql
"""
import pathlib
import sys

from app.db import engine  # loads .env + validates DATABASE_URL
from sqlalchemy import text

MIGRATION = pathlib.Path(__file__).parent / "migrations" / "001_init.sql"


def main() -> int:
    sql = MIGRATION.read_text()
    print(f"Applying {MIGRATION.name} …")
    # The script manages its own BEGIN/COMMIT, so run it on a raw autocommit
    # connection rather than wrapping it in another transaction.
    raw = engine.raw_connection()
    try:
        raw.autocommit = True
        with raw.cursor() as cur:
            cur.execute(sql)
    finally:
        raw.close()
    # Confirm the tables landed.
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            )
        ).all()
    print("✓ Migration applied. Tables now in the database:")
    for (name,) in rows:
        print(f"   - {name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
