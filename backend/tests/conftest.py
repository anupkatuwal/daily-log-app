"""Shared test fixtures: in-memory SQLite DB + TestClient."""
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Must be set BEFORE importing any app modules.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-tests-only")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

import app.models  # noqa: E402 — registers all ORM models with Base.metadata
from app.db import Base, get_db  # noqa: E402
from app.limiter import limiter  # noqa: E402
from app.main import app  # noqa: E402

# StaticPool ensures every session/connection shares the same in-memory DB.
_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSession = sessionmaker(bind=_engine, autocommit=False, autoflush=False)


@pytest.fixture(autouse=True)
def fresh_db():
    # Disable rate limiting so tests don't exhaust per-IP counters.
    limiter.enabled = False
    Base.metadata.create_all(_engine)
    yield
    Base.metadata.drop_all(_engine)
    limiter.enabled = True


@pytest.fixture
def client(fresh_db):
    def _override_db():
        db = _TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth(client):
    """Register a test user and return auth headers."""
    r = client.post("/api/auth/register", json={"username": "testuser", "pin": "1234"})
    assert r.status_code == 201, r.json()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
