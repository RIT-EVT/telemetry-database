from pymongo import MongoClient
from os import getenv
from urllib import parse

## Create a connection to the Mongo DB
#
# @return db connection object
def create_db_connection():
    connection_string = "mongodb://" + parse.quote_plus(str(getenv("MDB_USER"))) + ":" + parse.quote_plus(str(getenv("MDB_PASSWORD")))  + "@" + str(getenv("HOST")) + ":" + str(getenv("MDB_PORT"))
    mongo_client = MongoClient(connection_string)
    
    db_access = mongo_client["ernie"]
    return db_access

def authenticate_user(token):
    auth_connection = create_db_connection()["users"]
    
    # Query the db to see if the user's token is on it
    # If it is then allow the operation to continue
    # Otherwise return an error
    
    return (auth_connection.find_one({"auth_token":token})==None)
    
    