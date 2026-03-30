from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads, dumps
from bson import ObjectId


class ConfirmQueryApi(MethodView):
    def __init__(self, db):
        self.db = db

        self.db["custom"]

    def post(self):
        # Add or test a query against the DB
        mode = request.args.get("mode")
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

    def validate_id(self, doc_id):
        return (
            ObjectId.is_valid(doc_id)
            and self.db["custom-queries"].find_one({"_id": ObjectId(doc_id)})
            is not None
        )
