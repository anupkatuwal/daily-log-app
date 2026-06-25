"""Tests for /api/logs CRUD endpoints."""

SAMPLE_LOG = {
    "log_date": "2025-01-15",
    "bodyweight": 80.5,
    "meals": [
        {
            "name": "Meal 1",
            "sort_order": 0,
            "food_items": [
                {
                    "name": "Chicken",
                    "quantity": 1,
                    "unit": "serving",
                    "calories": 250,
                    "protein_g": 50.0,
                    "carbs_g": 0.0,
                    "fat_g": 5.0,
                    "sort_order": 0,
                }
            ],
        }
    ],
    "peds": [],
    "sessions": [],
    "notes": [],
}


def test_create_log(client, auth):
    r = client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    assert r.status_code == 201
    data = r.json()
    assert data["log_date"] == "2025-01-15"
    assert data["bodyweight"] == 80.5
    assert len(data["meals"]) == 1
    assert data["meals"][0]["food_items"][0]["name"] == "Chicken"


def test_create_duplicate_log(client, auth):
    client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    r = client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    assert r.status_code == 409


def test_list_logs(client, auth):
    client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    r = client.get("/api/logs", headers=auth)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_get_log(client, auth):
    client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    r = client.get("/api/logs/2025-01-15", headers=auth)
    assert r.status_code == 200
    assert r.json()["log_date"] == "2025-01-15"


def test_get_log_not_found(client, auth):
    r = client.get("/api/logs/2000-01-01", headers=auth)
    assert r.status_code == 404


def test_update_log(client, auth):
    client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    updated = {**SAMPLE_LOG, "bodyweight": 79.0, "meals": []}
    r = client.put("/api/logs/2025-01-15", json=updated, headers=auth)
    assert r.status_code == 200
    assert r.json()["bodyweight"] == 79.0
    assert r.json()["meals"] == []


def test_delete_log(client, auth):
    client.post("/api/logs", json=SAMPLE_LOG, headers=auth)
    r = client.delete("/api/logs/2025-01-15", headers=auth)
    assert r.status_code == 204
    r2 = client.get("/api/logs/2025-01-15", headers=auth)
    assert r2.status_code == 404


def test_logs_isolated_between_users(client):
    # Register two users
    r1 = client.post("/api/auth/register", json={"username": "user1", "pin": "1234"})
    r2 = client.post("/api/auth/register", json={"username": "user2", "pin": "1234"})
    h1 = {"Authorization": f"Bearer {r1.json()['access_token']}"}
    h2 = {"Authorization": f"Bearer {r2.json()['access_token']}"}

    client.post("/api/logs", json=SAMPLE_LOG, headers=h1)

    # user2 should not see user1's logs
    r = client.get("/api/logs", headers=h2)
    assert r.json() == []
