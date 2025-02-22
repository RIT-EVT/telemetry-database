from pymongo import MongoClient
from os import getenv
from urllib import parse
from cryptography.fernet import Fernet
## Create a connection to the Mongo DB
#
# @return db connection object
def create_db_connection():
    connection_string = "mongodb://" + parse.quote_plus(str(getenv("MDB_USER"))) + ":" + parse.quote_plus(str(getenv("MDB_PASSWORD")))  + "@" + str(getenv("HOST")) + ":" + str(getenv("MDB_PORT"))
    mongo_client = MongoClient(connection_string)
    
    db_access = mongo_client["ernie"]
    return db_access

## Make sure the user passes a valid auth_token that exists in the db
# In essence, make sure the user has logged in 
#
# @param auth_token token to query against the db
# @return bool if the auth_token exists
def authenticate_user(auth_token):
    
    # Query the db to see if the user's token is on it
    # If it is then allow the operation to continue
    # Otherwise return an error
    
    auth_connection = create_db_connection()["users"]
    
    
    
    return (auth_connection.find_one({"auth_token":auth_token})==None)


def check_expired_tokens(auth_token):
    
    
    
    return False