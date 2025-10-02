import os
from datetime import datetime
from json import dumps

folder_name=os.path.dirname(__file__)
data = {
                "mf4File": "", 
                "dbcFile": "",
                "contextData": dumps({
                    "event": {
                        "name": "test",
                        "location": "test",
                        "date": datetime.now().isoformat(),
                        "type": "test",
                        "runs": [
                            {
                                "orderNumber": 0,
                                "context": {
                                    "weather": "cold",
                                    "riderName": "BillyBob",
                                    "riderWeight": 80,
                                    "airTemp": 34,
                                    "windSpeed": 12.34,
                                    "windDirection": "NW",
                                    "riderFeedback": "The bike be moving",
                                    "distanceCovered": 12.2,
                                    "startTime": datetime.now().isoformat()
                                },
                                "originalDataFile": "",
                                "dbcFile": "",
                                "messages": []
                            }
                            ]
                        }
                    }),
                    "runOrderNumber": "1"
                }

## Valid test. Should return 201 and save data
def test_post_real_files(client, mock_db):
    # Open the files in binary mode then rename them before submission
    with open(os.path.join(folder_name, "test_data/ExampleData.MF4.test"), "rb") as mf4, open(os.path.join(folder_name, "test_data/DEV1_4_13.dbc.test"), "rb") as dbc:
        # For this data, we aren't bothering with the context data. That's the front end's job, we only care about data
        data["mf4File"]=(mf4, "ExampleData.MF4")
        data["dbcFile"]=(dbc, "DEV1_4_13.dbc")
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )


    # Assertions about return data
    assert response.status_code == 201
    assert response.get_json()["message"] == "Data received successfully"
    
    # Assertions about mongo query result
    pipeline = [
        {"$match": {"event.name": "test"}},  
        {"$unwind": "$event.runs"},
        {"$unwind": "$event.runs.messages"},
        {"$group": {"_id": None, "signals":
        {"$addToSet": "$event.runs.messages.signal"}}},
    ]
    
    result = set(list(mock_db["messages"].aggregate(pipeline, allowDiskUse=True))[0]["signals"])
    assert result.__len__()!=0
    assert result.__contains__("BmsCurrent")
    assert result.__contains__("Min_Pack_Temp") 
    
def test_post_missing_mf4(client):
    with open(os.path.join(folder_name, "test_data/DEV1_4_13.dbc.test"), "rb") as dbc:
        data["dbcFile"]=(dbc, "DEV1_4_13.dbc")
        data.pop("mf4File")
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )
    
    # Assertions about return data
    assert response.status_code == 400
    
    with open(os.path.join(folder_name, "test_data/DEV1_4_13.dbc.test"), "rb") as dbc:
        data["dbcFile"]=(dbc, "DEV1_4_13.dbc")
        data["mf4File"]=""
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )
    
    # Assertions about return data
    assert response.status_code == 400
    

def test_post_missing_dbc(client):
    with open(os.path.join(folder_name, "test_data/ExampleData.MF4.test"), "rb") as mf4:
        data["mf4File"]=(mf4, "ExampleData.mf4")
        data.pop("dbcFile")
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )
    
    # Assertions about return data
    assert response.status_code == 400
    
    with open(os.path.join(folder_name, "test_data/ExampleData.MF4.test"), "rb") as mf4:
        data["mf4File"]=(mf4, "ExampleData.mf4")
        data["dbcFile"]=""
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )
    
    # Assertions about return data
    assert response.status_code == 400
    
def test_post_missing_context(client):
    with open(os.path.join(folder_name, "test_data/ExampleData.MF4.test"), "rb") as mf4, open(os.path.join(folder_name, "test_data/DEV1_4_13.dbc.test"), "rb") as dbc:
        data["mf4File"]=(mf4, "ExampleData.MF4")
        data["dbcFile"]=(dbc, "DEV1_4_13.dbc")
        data.pop("contextData")
        response = client.post(
            "/DataUpload/0",
            data=data,
            content_type="multipart/form-data"
        )
            
    # Assertions about return data
    assert response.status_code == 400
    
def test_post_unauthorized_user(client):
    # No need to even submit data, it should fail automatically 
    response = client.post("/DataUpload/-1")
    
    # Assertions about return data
    assert response.status_code == 401
    
def test_post_expired_user(client):

    response = client.post("/DataUpload/1")
    
    # Assertions about return data
    assert response.status_code == 401