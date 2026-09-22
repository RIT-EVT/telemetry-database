from flask.views import MethodView
from flask import request, jsonify
import json
from bson import ObjectId

from utils import validate_user
from http_codes import HttpResponseType

class BikeConfigApi(MethodView):

    def __init__(self, db):
        self.db = db

    # This currently makes a db request per check, unsure if theirs a more efficant way to do this. - Owen
    def _hasOverlap(self, db_connection, object):
        res = db_connection.find_one({"type": object['type'], "name": object['name']})
        return res != None

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

        # This is going to be expecting an array of indivdual config objects.
        for object in config_data:
            hasOverlap = self._hasOverlap(db_connection, object)
            if hasOverlap:
                overlapCounter = 0
                startName = object['name']

                while hasOverlap == True:
                    overlapCounter += 1

                    object['name'] = f"{startName} ({overlapCounter})"
                    hasOverlap = self._hasOverlap(db_connection, object)

        # Add all of the objects as documents into the db.
        db_connection.insert_many(config_data)

        return {"success": "Data created"}, HttpResponseType.CREATED.value

    def delete(self, auth_token):
        """
        Sets configs in the database inactive status to true

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

        # This is going to be expecting an array of an object listing name and type.
        # Ex: { "name": "test", "type": "bike" }
        for object in config_data:
            if 'name' in object and 'type' in object:
                db_connection.update_one(object, {"$set": {"inactive": True}})
            else:
                """Do we want some sort of msg here? What if some are found but others arnt?"""

        return {"success": "Data set to 'inactive'"}, HttpResponseType.OK.value
