import os
import urllib
import pymongo

## Create a connection to the Mongo DB
#
# @return db connection object
def create_db_connection():
    connection_string = "mongodb://" + urllib.parse.quote_plus(str(os.getenv("MDB_USER"))) + ":" + urllib.parse.quote_plus(str(os.getenv("MDB_PASSWORD")))  + "@" + str(os.getenv("HOST")) + ":" + str(os.getenv("MDB_PORT"))
    mongo_client = pymongo.MongoClient(connection_string)
    
    db_access = mongo_client["ernie"]
    return db_access