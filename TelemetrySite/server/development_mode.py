import mongomock
import mongomock.gridfs
from bson import ObjectId
from datetime import datetime


def create_false_db_instance():
    """Create an in memory database

    Returns:
        DB: Database connection in memory
    """
    mock_client = mongomock.MongoClient()
    mongomock.gridfs.enable_gridfs_integration()

    db = mock_client["ernie"]

    _setup_config_mock(db)

    return db


def _setup_config_mock(mock_db):
    """Inject fake data into mock DB instance for testing

    Args:
        mock_db (Database): The database instance
    """

    # Insert a mock config document in the mongomock DB
    configs = mock_db["configs"]
    doc_id = ObjectId("67ae8d01097ab8ae923672f8")  # same as BIKE_CONFIG_DOC
    configs.insert_one(
        {
            "_id": doc_id,
            "config_data": {
                "tms": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {},
                        "name": "test",
                    }
                ]
            },
        }
    )

    # Insert a mock users for authentication
    users = mock_db["users"]

    users.insert_many(
        [
            {
                "username": "test_user_valid",
                "password": "123".encode(),
                "auth_token": "gP98MY0suUKvOycCW2PIvzeONtm0FnO6DfkaTVNrRHQ",
                "auth_time": datetime.now(),
            },
            {
                "username": "outdated_user",
                "password": "123".encode(),
                "auth_token": "1",
                "auth_time": datetime.min,
            },
            {
                "username": "duplicate_user",
                "password": "123".encode(),
                "auth_token": "2",
                "auth_time": datetime.now(),
            },
        ]
    )
