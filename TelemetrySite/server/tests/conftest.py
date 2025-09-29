import pytest
import sys
import os
from datetime import datetime
import dotenv
import mongomock
from bson import ObjectId
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from server import create_app

## Welcome to the conftest file for our integrated python testing.
#  This file should contain all fixtures we use for our testing.
#  For testing, we use the pytest to execute our tests and 
#  mongomock to create a mongo db in memory so we don't interact 
#  with our production db. To execute a test, enter pytest in the console.
#  Any and all new backend code require integrated python tests so future
#  developers know if they broke the system when changing it. Additionally,
#  if you are not connected to an RIT network when you execute the test,
#  test_utils.py will auto fail since it checks the connection to real mongo db.

@pytest.fixture
def app(mock_db):
    app = create_app(db=mock_db)
    app.config.update({
        "TESTING": True,
    })
    return app

@pytest.fixture(autouse=True, scope="session")
def load_test_env():
    # Force-load the fake test env instead of real one
    dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), ".env.test"), override=True)

@pytest.fixture(autouse=True)
def mock_db(monkeypatch):
    # Create a mock mongo db in memory for testing
    mock_client = mongomock.MongoClient()
    mock_db = mock_client["ernie"]

    # Patch create_db_connection globally to return the mock db
    monkeypatch.setattr("utils.create_db_connection", lambda: mock_db)

    yield mock_db  # Makes mock_db accessible in individual tests


@pytest.fixture(autouse=True)
def setup_config_doc(mock_db):
    # Insert a mock config document in the mongomock DB
    configs = mock_db["configs"]
    doc_id = ObjectId("67ae8d01097ab8ae923672f8")  # same as BIKE_CONFIG_DOC
    configs.insert_one({
        "_id": doc_id,
        "config_data": {
            "tms":[
                {
                "hardwareRevisionTMS" : 1,      
                }
            ]
        }
    })

    # Insert a mock user for authentication
    users = mock_db["users"]

    users.insert_one({
        "username": "test_user_valid",
        "password": "123".encode(),
        "auth_token": 0,
        "auth_time": datetime.now()
    })
    
    users.insert_one({
        "username": "outdated_user",
        "password": "123".encode(),
        "auth_token": 1,
        "auth_time": datetime.min
    })
    
    return 0

@pytest.fixture
def client(app):
    return app.test_client()