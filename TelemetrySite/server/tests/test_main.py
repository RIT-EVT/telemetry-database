from http_codes import HttpResponseType

def test_main_context(client):
    response = client.get("/")
    assert response.status_code == HttpResponseType.OK.value, f"Unexpected response code {response.status_code}"