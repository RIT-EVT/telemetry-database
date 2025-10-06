from flask.views import MethodView
from flask import request

from os import getenv
from utils import create_auth_token, update_expired_token
from datetime import datetime

from http_codes import HttpResponseType

class UserAuthApi(MethodView):   
    def __init__(self, db):
        self.db = db

    def post(self):
        user_data = request.get_json()
        
        user_db_connection = self.db["users"]
        match user_data.get("action"):
            case "login":
                
                # Check the username and password against the db to make sure the user
                # exists and they are who they say they are. Return auth token if the 
                # values are correct, otherwise return an invalid user error
                
                username = user_data.get("name")
                password = user_data.get("password")
                
                mongo_data = user_db_connection.find_one({"username":username, "password":password.encode()})
            
                if mongo_data == None:
                    return HttpResponseType.UNAUTHORIZED.error()      
                else:
                    auth_token = mongo_data["auth_token"]
                    # always update auth token on login
                    auth_token = update_expired_token(mongo_data["_id"], self.db)
                    return {"auth_token": auth_token}, HttpResponseType.OK.value   
            case "signup":
                
                username = user_data.get("name")
                password = user_data.get("password")  
                secure_num = user_data.get("secureNum")
                
                current_date_time = datetime.now()   
                
                if secure_num != getenv("CHALLENGE_NUM"):
                    # User value doesn't match the needed value
                    # return an error message
                    return HttpResponseType.UNAUTHORIZED.error()
                # Ensure all data submitted exists to prevent any empty users
                elif username == "" or password == "":
                    return HttpResponseType.UNAUTHORIZED.error()
                # Ensure there isn't any duplicate usernames
                elif user_db_connection.find_one({"username":username})!=None:
                    return HttpResponseType.UNAUTHORIZED.error()
                else:
                    auth_token = create_auth_token(self.db)    
                    user_db_connection.insert_one({"username" : username, "password" : password.encode(),
                                                    "auth_token" : auth_token, "auth_time" : current_date_time})
                    
                    return {"auth_token":auth_token}, HttpResponseType.CREATED.value    
            case _:
                return HttpResponseType.NOT_FOUND.error()