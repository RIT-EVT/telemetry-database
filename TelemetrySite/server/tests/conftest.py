import pytest
import sys
import os
from datetime import datetime
import dotenv
import mongomock
import mongomock.gridfs
from bson import ObjectId

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from server import create_app
from development_mode import create_false_db_instance

## Welcome to the conftest file for our integrated python testing.
#  This file should contain all fixtures we use for our testing.
#
## For testing, we use the pytest to execute our tests and
#  mongomock to create a mongo db in memory so we don't interact
#  with our production db. To execute a test, enter pytest in the console.
#  Any and all new backend code require integrated python tests so future
#  developers know if they broke the system when changing it.
#
## Currently, GitHub actions runs these test automatically whenever a pr
#  targets main. This way, we never merge code into main that is broken (hopefully),
#  but it is also useful to run these test as you're updating the code so you know
#  ahead of time if your changes are working or not
#
## Any and all new features for our backend need test cases. This includes
#  testing all edge cases (ex: what if a user tries to upload an incorrect file)
#  and all possible events. No test cases will ever be perfect, but we want
#  our to be as close as we can get it.


@pytest.fixture
def app(mock_db):
    app = create_app(db=mock_db)
    app.config.update(
        {
            "TESTING": True,
        }
    )
    return app


@pytest.fixture(autouse=True, scope="session")
def load_test_env():
    # Force-load the fake test env instead of real one
    dotenv.load_dotenv(
        os.path.join(os.path.dirname(__file__), ".env.test"), override=True
    )


@pytest.fixture(autouse=True)
def mock_db(monkeypatch):

    mock_db = create_false_db_instance()

    # Patch create_db_connection globally to return the mock db
    monkeypatch.setattr("utils.create_db_connection", lambda: mock_db)

    yield mock_db  # Makes mock_db accessible in individual tests


@pytest.fixture
def client(app):
    return app.test_client()
