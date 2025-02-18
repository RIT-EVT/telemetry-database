from flask.views import MethodView
from flask import request, jsonify
from secrets import token_urlsafe
from os import getenv
from utils import create_db_connection

class UserAuthApi(MethodView):   
   
    def post(self):
        user_data = request.get_json()
        
        user_db_connection = create_db_connection()["users"]
        
        if user_data.get("action")=="login":
            username = user_data.get("name")
            password = user_data.get("password")
            
        elif user_data.get("action") == "signup":
            username = user_data.get("name")
            password = user_data.get("password")  
            secure_num = user_data.get("secureNum")    
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
                
                user_db_connection.insert_one({"username":username, "password":password, "auth_token":auth_token})
                    
            
        return jsonify({"error":"problem"}), 200