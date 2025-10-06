import json
from http_codes import HttpResponseType


def test_bike_config_read(client):
    response = client.get("/ConfigData/0")
    assert response.status_code == HttpResponseType.OK.value, "Authorized user not allowed"
    json_data = response.get_json()
    assert "data" in json_data
    assert "config_data" in json_data["data"]
    assert "tms" in json_data["data"]["config_data"]
    assert "hardwareRevisionTMS" in json_data["data"]["config_data"]["tms"][0]
    assert 1 == json_data["data"]["config_data"]["tms"][0]["hardwareRevisionTMS"]

def test_bike_config_read_unauthorized(client):
    response = client.get("/ConfigData/-1")
    assert response.status_code == HttpResponseType.UNAUTHORIZED.value, "Unauthorized user accessed data"

def test_bike_config_read_outdated(client):
    response = client.get("/ConfigData/1")
    assert response.status_code == HttpResponseType.UNAUTHORIZED.value, "Outdated user allowed access"

def test_bike_config_write(client):
    config_payload = {
        "bms": 
            {
                "hardwareRevisionBMS": 1,
            }
    }

    response = client.post(
        "/ConfigData/0",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded"
    )

    assert response.status_code == HttpResponseType.CREATED.value
    
    response = client.get("/ConfigData/0")
    assert response.status_code == HttpResponseType.OK.value
    json_data = response.get_json()

    assert "data" in json_data
    assert "config_data" in json_data["data"]
    assert "bms" in json_data["data"]["config_data"]
    assert "hardwareRevisionBMS" in json_data["data"]["config_data"]["bms"][0]
    assert 1 == json_data["data"]["config_data"]["bms"][0]["hardwareRevisionBMS"]

def test_bike_config_write_unauthorized(client):
    config_payload = {
        "bms": 
            {
                "hardwareRevisionBMS": 1,
            }
    }

    response = client.post(
        "/ConfigData/-1",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded"
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "Unauthorized user accessed data"

def test_bike_config_write_expired(client):
    config_payload = {
        "bms": 
            {
                "hardwareRevisionBMS": 1,
            }
    }

    response = client.post(
        "/ConfigData/1",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded"
    )
    
    assert response.status_code==HttpResponseType.UNAUTHORIZED.value, "Expired user accessed data"