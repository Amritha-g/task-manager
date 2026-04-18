from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    # just checking if the server is up
    response = client.get("/health")
    assert response.status_code == 200

def test_register():
    # test if a user can register
    user_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/register", json=user_data)
    # 201 created or 400 if user exists (running test multiple times)
    assert response.status_code in [201, 400]

def test_login():
    # test if we can login
    form_data = {"username": "test@example.com", "password": "password123"}
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
