from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health(): # check if the server is up
    response = client.get("/health")
    assert response.status_code == 200

def test_register(): #testing user reg 
    user_data = {"email": "test@example.com", "password": "password123"}
    response = client.post("/auth/register", json=user_data)
    assert response.status_code in [201, 400]

def test_login():
    form_data = {"username": "test@example.com", "password": "password123"}
    response = client.post("/auth/login", data=form_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
