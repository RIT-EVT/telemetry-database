from pymongo import MongoClient
from os import getenv
from urllib import parse
from datetime import datetime
from secrets import token_urlsafe
from bson import ObjectId

def create_db_connection():
    """
        Create a connection to the database

    Returns:
        Database: Database connection
    """
    connection_string = "mongodb://" + parse.quote_plus(str(getenv("MDB_USER"))) + ":" + parse.quote_plus(str(getenv("MDB_PASSWORD")))  + "@" + str(getenv("HOST")) + ":" + str(getenv("MDB_PORT"))
    mongo_client = MongoClient(
        connection_string,
        serverSelectionTimeoutMS=2000,   # total time to find a suitable server
        connectTimeoutMS=1000,           # time to establish TCP connection
        socketTimeoutMS=1000             # time to wait for response on socket
    )
    
    db_access = mongo_client["ernie"]
    return db_access

def create_auth_token(db):
    """
        Generate a 32 byte long auth token

    Returns:
        string: Auth token
    """
    user_db_connection = db["users"]

    auth_token=token_urlsafe(32)
    # Very slight chance that there is a duplicate auth token
    # There are 8e506 total tokens, so it will probably never occur
    # but still need to check. If this ever catches a duplicate, go buy
    # a lottery ticket
    while user_db_connection.find_one({"auth_token":auth_token})!=None:
            auth_token=token_urlsafe(32)
            print("Go to the lottery!")
            
    return auth_token

def authenticate_user(auth_token, db):
    """
        Make sure the user passes a valid auth_token that exists in the db.
        In essence, make sure the user has logged in 

    Args:
        auth_token (String): Auth token to check

    Returns:
        Boolean: If the auth token is valid
    """
    
    # Query the db to see if the user's token is on it
    # If it is then allow the operation to continue
    # Otherwise return an error
    auth_connection = db["users"]    
    auth_token=convert_to_int(auth_token)
    return (auth_connection.find_one({"auth_token":auth_token})!=None)

def check_expired_tokens(auth_token, db):
    """
        Check if the user's token is expired

    Args:
        auth_token (String): User's auth token to check

    Returns:
        Boolean: If the user's session is expired
    """
    
    auth_connection = db["users"]
    auth_token=convert_to_int(auth_token)
    auth_time = auth_connection.find_one({"auth_token":auth_token})["auth_time"]
    # only allow an auth token to last a day
    days = (datetime.now()-auth_time).days
    
    return (days>1)

def update_expired_token(document_id, db):
    """
        Generate a new token for the user if its expired

    Args:
        document_id (String): Id for the document

    Returns:
        String: Updated auth token
    """
    
    new_auth_token = create_auth_token(db)
    auth_connection = db["users"]
    
    auth_connection.update_one(  {"_id": ObjectId(document_id)},
            {"$set": {"auth_token":new_auth_token, "auth_time":datetime.now()}})
    return new_auth_token

def convert_to_int(value):
    
    if type(value) == str:
        return int(value)
    return value