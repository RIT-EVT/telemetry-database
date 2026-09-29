from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads, dumps
from bson import ObjectId
import query_scripts.query_utils as query_utils


class ConfirmQueryApi(MethodView):
    def __init__(self, db):
        self.db = db

    def post(self):
        # Add or test a query against the DB
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        valid_id = query_utils.get_valid_doc(self.db, doc_id)

        if valid_id is not None:
            self.db["custom-queries"].update_one(
                {"_id": ObjectId(doc_id)},
                {
                    "$set": {
                        "query-finished": True,
                    }
                },
            )
            return 200

        return 404
