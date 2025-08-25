from pymongo import MongoClient
from os import getenv
from urllib import parse
from cryptography.fernet import Fernet
from datetime import datetime
from secrets import token_urlsafe
from bson import ObjectId


## Create a connection to the Mongo DB
#
# @return db connection object
def create_db_connection():
    connection_string = "mongodb://" + parse.quote_plus(str(getenv("MDB_USER"))) + ":" + parse.quote_plus(str(getenv("MDB_PASSWORD")))  + "@" + str(getenv("HOST")) + ":" + str(getenv("MDB_PORT"))
    mongo_client = MongoClient(
        connection_string,
         serverSelectionTimeoutMS=2000,  # total time to find a suitable server
        connectTimeoutMS=1000,           # time to establish TCP connection
        socketTimeoutMS=1000             # time to wait for response on socket
    )
    
    db_access = mongo_client["ernie"]
    return db_access

def create_auth_token():
    user_db_connection = create_db_connection()["users"]

    auth_token=token_urlsafe(32)
    # Very slight chance that there is a duplicate auth token
    # There are 8e506 total tokens, so it will probably never occur
    # but still need to check. If this ever catches a duplicate, go buy
    # a lottery ticket
    while user_db_connection.find_one({"auth_token":auth_token})!=None:
            auth_token=token_urlsafe(32)
            print("Go to the lottery!")
            
    return auth_token

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
    auth_token=convert_to_int(auth_token)
    return (auth_connection.find_one({"auth_token":auth_token})!=None)

## Check if the user's auth session has expired
#
# @param auth_time time the user's auth session started
# @return bool if too much time has passed since it was created
def check_expired_tokens(auth_token):
    print("checking expired token")
    auth_connection = create_db_connection()["users"]
    auth_token=convert_to_int(auth_token)
    auth_time = auth_connection.find_one({"auth_token":auth_token})["auth_time"]
    # only allow an auth token to last a day
    days = (datetime.now()-auth_time).days
    
    return (days>1)


def update_expired_token(document_id):
    
    new_auth_token = create_auth_token()
    auth_connection = create_db_connection()["users"]
    
    auth_connection.update_one(  {"_id": ObjectId(document_id)},
            {"$set": {"auth_token":new_auth_token, "auth_time":datetime.now()}})
    return new_auth_token

def convert_to_int(value):
    
    if type(value) == str:
        return int(value)
    return value