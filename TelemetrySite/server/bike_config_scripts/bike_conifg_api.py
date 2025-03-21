from flask.views import MethodView
from flask import request, jsonify
import cantools
import pymongo
from asammdf import MDF
import json
from more_itertools import sliced
from bson import ObjectId
import os
import urllib
import gridfs

class BikeConfigApi(MethodView):
    
    BIKE_CONFIG_DOC = '67ae8d01097ab8ae923672f8'
    
    ## Create a connection to the Mongo DB
    #
    # @return db connection object
    def create_db_connection(self):
        connection_string = "mongodb://" + urllib.parse.quote_plus(str(os.getenv("MDB_USER"))) + ":" + urllib.parse.quote_plus(str(os.getenv("MDB_PASSWORD")))  + "@" + str(os.getenv("HOST")) + ":" + str(os.getenv("MDB_PORT"))
        mongo_client = pymongo.MongoClient(connection_string)
        
        db_access = mongo_client["ernie"]
        return db_access
    
    def get(self):
        
        db_connection = self.create_db_connection()["configs"]
        config_data = db_connection.find_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)})
        
        if config_data:
            config_data["_id"] = str(config_data["_id"])  # Convert ObjectId to string
        
        return jsonify({"data":config_data}), 200
    
    def post(self):
        db_connection = self.create_db_connection()["configs"]
        config_data = request.form["configData"]
    
        config_data = json.loads(config_data)
    
        for key in config_data:
            if len(config_data[key])!=0:
                db_connection.update_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)}, {"$push":{f"config_data.{key}":config_data[key]}})

        return jsonify({"error": "Not implemented"}), 200
    
    
    def delete(self):
        return jsonify({"error":"Not implemented"}), 501
    
    
    