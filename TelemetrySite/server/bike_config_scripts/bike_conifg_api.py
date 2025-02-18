from flask.views import MethodView
from flask import request, jsonify
import pymongo
import json
from bson import ObjectId
import os
import urllib
from utils import create_db_connection

class BikeConfigApi(MethodView):
    
    BIKE_CONFIG_DOC = '67ae8d01097ab8ae923672f8'
    
    
    def get(self):
        
        db_connection = create_db_connection()["configs"]
        config_data = db_connection.find_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)})
        
        if config_data:
            config_data["_id"] = str(config_data["_id"])  # Convert ObjectId to string
        
        return jsonify({"data":config_data}), 200
    
    def post(self):
        db_connection = create_db_connection()["configs"]
        config_data = request.form["configData"]
    
        config_data = json.loads(config_data)
    
        for key in config_data:
            if len(config_data[key])!=0:
                db_connection.update_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)}, {"$push":{f"config_data.{key}":config_data[key]}})

        return jsonify({"error": "Not implemented"}), 501
    
    
    def delete(self):
        return jsonify({"error":"Not implemented"}), 501
    
    
    