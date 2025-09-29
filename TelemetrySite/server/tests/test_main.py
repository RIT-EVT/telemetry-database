def test_main_context(client):
    response = client.get("/")
    assert response.status_code == 200, f"Unexpected response code {response.status_code}"