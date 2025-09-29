from flask.views import MethodView
from flask import request, jsonify

from os import getenv
from utils import create_auth_token, update_expired_token
from datetime import datetime


class UserAuthApi(MethodView):   
    def __init__(self, db):
        self.db = db

    def post(self):
        user_data = request.get_json()
        
        user_db_connection = self.db["users"]
        
        if user_data.get("action")=="login":
            # Check the username and password against the db to make sure the user
            # exists and they are who they say they are. Return auth token if the 
            # values are correct, otherwise return an invalid user error
            
            username = user_data.get("name")
            password = user_data.get("password")
            
            mongo_data = user_db_connection.find_one({"username":username, "password":password.encode()})
        
            if mongo_data == None:
                return {"error":"Invalid username or password"}, 404        
            else:
                auth_token = mongo_data["auth_token"]
                # always update auth token on login
                auth_token = update_expired_token(mongo_data["_id"], self.db)
                return {"auth_token": auth_token}, 200   
        elif user_data.get("action") == "signup":
            
            username = user_data.get("name")
            password = user_data.get("password")  
            secure_num = user_data.get("secureNum")
            
            current_date_time = datetime.now()   
            
            if secure_num != getenv("CHALLENGE_NUM"):
                # User value doesn't match the needed value
                # return an error message
                return {"error":"Incorrect challenge number"}, 400   
            # Ensure all data submitted exists to prevent any empty users
            elif username == "" or password == "":
                return {"error":"Invalid username or password"}, 400
            # Ensure there isn't any duplicate usernames
            elif user_db_connection.find_one({"username":username})!=None:
                return {"error":"Duplicate username detected"}, 400
            else:
                
                auth_token = create_auth_token(self.db)    
                user_db_connection.insert_one({"username" : username, "password" : password.encode(),
                                                "auth_token" : auth_token, "auth_time" : current_date_time})
                
                return {"auth_token":auth_token}, 200   
        else:
            return{"error":"Invalid action"}, 400