from flask.views import MethodView
from flask import request, jsonify

import json
from bson import ObjectId

from utils import create_db_connection, authenticate_user, check_expired_tokens

class BikeConfigApi(MethodView):
  
    BIKE_CONFIG_DOC = '67ae8d01097ab8ae923672f8'
    
    
    def get(self, auth_token):
        """
        Get all configs that are currently active

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: All configs currently saved
        """
        
        if not authenticate_user(auth_token):
            return jsonify({"authError":"unauthenticated user"}), 400
        elif check_expired_tokens(auth_token):
            return jsonify({"authError":"expired user token"}), 400
        
        db_connection = create_db_connection()["configs"]
        config_data = db_connection.find_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)})
        
        if config_data:
            config_data["_id"] = str(config_data["_id"])  # Convert ObjectId to string

        return jsonify({"data":config_data}), 200
    
    def post(self, auth_token):
        """
        Add new configs to the database

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: success message
        """
        
        if not authenticate_user(auth_token):
            return jsonify({"authError":"unauthenticated user"}), 400
        elif check_expired_tokens(auth_token):
            return jsonify({"authError":"expired user token"}), 400
        
        db_connection = create_db_connection()["configs"]
        config_data = request.form["configData"]
    
        config_data = json.loads(config_data)
    
        for key in config_data:
            if len(config_data[key])!=0:
                db_connection.update_one({"_id":ObjectId(self.BIKE_CONFIG_DOC)}, {"$push":{f"config_data.{key}":config_data[key]}})

        return jsonify({"success": "Data created"}), 201
    
    
    def delete(self):
        return jsonify({"error":"Not implemented"}), 501
    
    
    