import json

def test_bike_config_read(client):
    response = client.get("/ConfigData/0")
    assert response.status_code == 200, "Authorized user not allowed"
    
    json_data = response.get_json()
    assert "data" in json_data
    assert "bike" in json_data["data"]
    assert "savedConfigs" in json_data["data"]["bike"][0]

def test_bike_config_read_unauthorized(client):
    response = client.get("/ConfigData/-1")
    assert response.status_code == 401, "Unauthorized user accessed data"


def test_bike_config_read_outdated(client):
    response = client.get("/ConfigData/1")
    assert response.status_code == 401, "Outdated user allowed access"

def test_bike_config_write(client):
    configName = "BIKE_CONFIG_WRITE_TEST"
    config_payload = [
        {
            "type": "bms",
            "name": configName,
            "inactive": False,
            "hardwareRevision": 1,
            "firmwareCommitHash": 1,
            "data": {
                "totalVoltageUnits": "V",
                "batteryVoltageUnits": "V",
                "currentUnits": "A",
                "packTempUnits": "C",
                "bqTempUnits": "C",
                "cellVoltageUnits": "V",
            },
        },
    ]

    response = client.post(
        "/ConfigData/0",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == 201

    response = client.get("/ConfigData/0")
    assert response.status_code == 200
    json_data = response.get_json()

    assert "data" in json_data
    assert "bms" in json_data["data"]

    hasConfigName = False
    for config in json_data["data"]["bms"]:
        if "name" in config and config["name"] == configName:
            hasConfigName = True
            break

    assert hasConfigName, "Failed to find freshly written config."

def test_bike_config_write_unauthorized(client):
    config_payload = {
        "bms": {
            "hardwareRevisionBMS": 1,
        }
    }

    response = client.post(
        "/ConfigData/-1",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == 401, "Unauthorized user accessed data"

def test_bike_config_write_expired(client):
    config_payload = {
        "bms": {
            "hardwareRevisionBMS": 1,
        }
    }

    response = client.post(
        "/ConfigData/1",
        data={"configData": json.dumps(config_payload)},
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == 401, "Expired user accessed data"
