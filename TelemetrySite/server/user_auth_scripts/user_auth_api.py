from flask.views import MethodView
from flask import request, Flask

from os import getenv
from datetime import datetime

from utils import create_auth_token, update_expired_token, get_user_id_from_token
from http_codes import HttpResponseType
from log_util import log_warning, log_info

MIN_USER_ID = 100

class UserAuthApi(MethodView):
    def __init__(self, db, app: Flask):
        self.db = db
        self.app: Flask = app

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

                mongo_data = user_db_connection.find_one(
                    {"username": username, "password": password.encode()}
                )

                if mongo_data == None:
                    log_warning(self.app, request, "Invalid user data", -1, f"Attempted to log into \"{username}\" but account does not exist or password was entered wrong", HttpResponseType.UNAUTHORIZED.error())
                    return HttpResponseType.UNAUTHORIZED.error()
                else:
                    auth_token = mongo_data["auth_token"]
                    user_id = get_user_id_from_token(auth_token, self.db)

                    if user_id == -1:
                        log_warning(self.app, request, "Invalid User ID", user_id, f"Attempted to log into \"{username}\" but got an invalid user_id", HttpResponseType.UNAUTHORIZED.error())
                        return HttpResponseType.UNAUTHORIZED.error()
                    else:
                        log_info(self.app, request, "Sucesfully logged in", user_id, HttpResponseType.OK.value)

                    # always update auth token on login
                    # TODO undo when merging main
                    # auth_token = update_expired_token(mongo_data["_id"], self.db)
                    return {"auth_token": auth_token}, HttpResponseType.OK.value
            case "signup":

                username = user_data.get("name")
                password = user_data.get("password")
                secure_num = user_data.get("secureNum")

                current_date_time = datetime.now()

                if secure_num != "1":
                    # User value doesn't match the needed value
                    # return an error message
                    error = HttpResponseType.UNAUTHORIZED.error() # TODO: Wouldnt this be a bad request??
                    log_warning(self.app, request, "Invalid Security Number", -1, f"Attempted to create an account, but got a security number of {secure_num}", error)
                    return error
                # Ensure all data submitted exists to prevent any empty users
                elif username == "":
                    error = HttpResponseType.UNAUTHORIZED.error() # TODO: Wouldnt this be a bad request??
                    log_warning(self.app, request, "Invalid Username", -1, f"Attempted to create an account, but got a empty username", error)
                    return error
                elif password == "":
                    error = HttpResponseType.UNAUTHORIZED.error() # TODO: Wouldnt this be a bad request??
                    log_warning(self.app, request, "Invalid Password", -1, f"Attempted to create an account, but got a empty password", error)
                    return error
                # Ensure there isn't any duplicate usernames
                elif user_db_connection.find_one({"username": username}) != None:
                    error = HttpResponseType.UNAUTHORIZED.error() # TODO: Wouldnt this be a bad request??
                    log_warning(self.app, request, "Existing User", -1, f"Attempted to create an account, but a user with the name \"{username}\" already exists", error)
                    return error
                else:
                    user_id = None
                    db_result = list(user_db_connection.aggregate([
                        {
                            "$group": {
                                "_id": None,
                                "max_value": {"$max": "$user_id"}
                            }
                        }
                    ]))

                    if db_result:
                        max_id = db_result[0]["max_value"]
                        if max_id >= MIN_USER_ID:
                            user_id = max_id + 1
                    if user_id == None:
                        user_id = MIN_USER_ID

                    auth_token = create_auth_token(self.db)
                    user_db_connection.insert_one(
                        {
                            "username": username,
                            "password": password.encode(),
                            "auth_token": auth_token,
                            "auth_time": current_date_time,
                            "user_id": user_id,
                        }
                    )

                    log_info(self.app, request, f"Sucesfully created user \"{username}\"", user_id, HttpResponseType.CREATED.value)
                    return {"auth_token": auth_token}, HttpResponseType.CREATED.value
            case _:
                log_warning(self.app, request, "Action Not Found", -1, f"\"{user_data.get("action")}\" is not a valid user auth action", HttpResponseType.NOT_FOUND.error())
                return HttpResponseType.NOT_FOUND.error()
