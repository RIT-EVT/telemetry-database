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
                "bike": [
                    {
                        "name": "test",
                        "savedConfigs": {
                            "bms": "test",
                            "imu": "test",
                            "tmu": "test",
                            "tms": "test",
                            "pvc": "test",
                            "mc": "test",
                        },
                    }
                ],
                "bms": [
                    {
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
                        "name": "test",
                    }
                ],
                "imu": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {
                            "eulerUnits": "Temp",
                            "gyroUnits": "Temp",
                            "linearAccelerationUnits": "jerk",
                            "accelerometerUnits": "ms/s",
                        },
                        "name": "test",
                    }
                ],
                "tmu": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {
                            "thermalUnits": "C",
                        },
                        "name": "test",
                    }
                ],
                "tms": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {
                            "tempUnits": "C",
                            "pumpSpeedUnits": "rpm",
                            "fanSpeedUnits": "rpm",
                        },
                        "name": "test",
                    }
                ],
                "pvc": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {},
                        "name": "test",
                    }
                ],
                "mc": [
                    {
                        "hardwareRevision": 1,
                        "firmwareCommitHash": 1,
                        "data": {"model": "test", "firmwareVersion": "test"},
                        "name": "test",
                    }
                ],
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
                "auth_token": "0",
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
