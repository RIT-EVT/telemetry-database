from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads
from bson import ObjectId


class QueryManagement(MethodView):

    def __init__(self, db):
        self.db = db

    def delete(self):

        # Delete a query document specified by the user
        # TODO Eventually convert this from a delete system to an inactive system

        auth_token = request.args.get("auth_token")
        doc_id = request.args.get("doc_id")

        if auth_token == None or doc_id == None:
            return {
                "error": "Missing auth_token or doc_id"
            }, HttpResponseType.BAD_REQUEST

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        # Delete specific query
        self.db["custom-queries"].delete_one({"_id": ObjectId(doc_id)})

        return HttpResponseType.OK

    def get(self):
        # Return an entire document

        auth_token = request.args.get("auth_token")
        doc_id = request.args.get("doc_id")

        if auth_token == None or doc_id == None:
            return {
                "error": "Missing auth_token or doc_id"
            }, HttpResponseType.BAD_REQUEST

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        result = list(self.db["custom-queries"].get_one({"_id": doc_id}))

        return {"response": result}, HttpResponseType.OK
