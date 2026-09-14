from flask.views import MethodView
from flask import request, jsonify
import json
from bson import ObjectId

from utils import validate_user
from http_codes import HttpResponseType


class BikeConfigApi(MethodView):

    def __init__(self, db):
        self.db = db

    def get(self, auth_token):
        """
        Get all configs that are currently active

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: All configs currently saved
        """

        # User Validation
        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        # Data Fetching & Aggrigation
        db_connection = self.db["configs"]
        pipeline = [
            {"$match": {"inactive": False}},
            {"$group": {
                "_id": "$type",
                "data": {
                    "$push": {
                        "k": "$name",
                        "v": "$$ROOT"
                    },
                },
            }},
            {"$project": {
                "_id": 0,
                "k": "$type",
                "v": { "$arrayToObject": "$data" },
            }},
            {"$replaceRoot": { "newRoot": "$v" }},
        ]

        retreived_data = list(db_connection.aggregate(pipeline))
        config_data = {group[next(iter(group))]["type"]: list(group.values()) for group in retreived_data}

        # Need to remove all of the "_id" objects
        for _, options in config_data.items():
            for data in options:
                del data["_id"]

        return {"data": config_data}, HttpResponseType.OK.value

    # TODO: Update Post to use new standard!
    # For this to be done in a way that is testable, front-end development
    # is needed to recreate the UI to be able to create new configs.
    def post(self, auth_token):
        """
        Add new configs to the database

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: success message
        """

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        db_connection = self.db["configs"]
        config_data = request.form["configData"]

        config_data = json.loads(config_data)

        for key in config_data:
            if len(config_data[key]) != 0:
                db_connection.update_one(
                    {"_id": ObjectId(self.BIKE_CONFIG_DOC)},
                    {"$push": {f"config_data.{key}": config_data[key]}},
                )

        return {"success": "Data created"}, HttpResponseType.CREATED.value

    # TODO: Create delete to change the "inactive" flag to true on database entries
    def delete(self):
        return HttpResponseType.NOT_IMPLEMENTED.error()
