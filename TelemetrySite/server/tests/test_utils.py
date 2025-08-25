from pymongo.database import Database
from utils import create_db_connection

# Ensure the database connection is made
def test_create_database_connection():
    db = create_db_connection()
    assert isinstance(db, Database), "Expected a pymongo Database instance"
    assert db.name == "ernie"
    assert db.command("ping").get("ok") == 1.0, "Database did not respond to ping"