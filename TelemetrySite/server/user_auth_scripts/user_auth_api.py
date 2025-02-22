from flask.views import MethodView
from flask import request, jsonify
from secrets import token_urlsafe
from os import getenv
from utils import create_db_connection
from datetime import datetime


class UserAuthApi(MethodView):   
   
    def post(self):
        
        user_data = request.get_json()
        
        user_db_connection = create_db_connection()["users"]
        # Check the username and password against the db to make sure the user
        # exists and they are who they say they are. Return auth token if the 
        # values are correct, otherwise return an invalid user error
        if user_data.get("action")=="login":
            username = user_data.get("name")
            password = user_data.get("password")
            
            mongo_data = user_db_connection.find_one({"username":username, "password":password.encode()})
            
            if mongo_data == None:
                return jsonify({"error":"Invalid username or password"}), 404        
            else:
                return jsonify({"auth_token": mongo_data["auth_token"]}), 200
            
        elif user_data.get("action") == "signup":
            username = user_data.get("name")
            password = user_data.get("password")  
            secure_num = user_data.get("secureNum")
            current_date_time = datetime.now()    
            if secure_num != getenv("CHALLENGE_NUM"):
                # User value doesn't match the needed value
                # return an error message
                return jsonify({"error":"Incorrect challenge number"}), 400   
            # Ensure all data submitted exists to prevent any empty users
            elif username == "" or password == "":
                return jsonify({"error":"Invalid username or password"}), 400
            # Ensure there isn't any duplicate usernames
            elif user_db_connection.find_one({"username":username})!=None:
                return jsonify({"error":"Duplicate username detected"}), 400
            else:
                auth_token=token_urlsafe(32)
                # Very slight chance that there is a duplicate auth token
                # There are 8e506 total tokens, so it will probably never occur
                # but still need to check. If this ever catches a duplicate, go buy
                # a lottery ticket
                while user_db_connection.find_one({"auth_token":auth_token})!=None:
                    auth_token=token_urlsafe(32)
                    print("Go to the lottery!")
                                
                user_db_connection.insert_one({"username" : username, "password" : password.encode(),
                                               "auth_token" : auth_token, "auth_time" : current_date_time})
                
                return jsonify({"auth_token":auth_token})
                    
            
        return jsonify({"error":"Code reached the end of the call"}), 400