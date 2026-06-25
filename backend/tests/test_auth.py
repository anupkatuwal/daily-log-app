"""Tests for /api/auth/register and /api/auth/login."""


def test_register_success(client):
    r = client.post("/api/auth/register", json={"username": "alice", "pin": "1234"})
    assert r.status_code == 201
    assert "access_token" in r.json()


def test_register_duplicate_username(client):
    client.post("/api/auth/register", json={"username": "alice", "pin": "1234"})
    r = client.post("/api/auth/register", json={"username": "alice", "pin": "5678"})
    assert r.status_code == 409


def test_register_username_too_short(client):
    r = client.post("/api/auth/register", json={"username": "ab", "pin": "1234"})
    assert r.status_code == 422


def test_register_pin_too_short(client):
    r = client.post("/api/auth/register", json={"username": "alice", "pin": "123"})
    assert r.status_code == 422


def test_register_invalid_username_chars(client):
    r = client.post("/api/auth/register", json={"username": "al!ce", "pin": "1234"})
    assert r.status_code == 422


def test_login_success(client):
    client.post("/api/auth/register", json={"username": "alice", "pin": "1234"})
    r = client.post("/api/auth/login", json={"username": "alice", "pin": "1234"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_wrong_pin(client):
    client.post("/api/auth/register", json={"username": "alice", "pin": "1234"})
    r = client.post("/api/auth/login", json={"username": "alice", "pin": "wrong"})
    assert r.status_code == 401


def test_login_unknown_user(client):
    r = client.post("/api/auth/login", json={"username": "nobody", "pin": "1234"})
    assert r.status_code == 401


def test_protected_without_token(client):
    r = client.get("/api/logs")
    assert r.status_code == 401
