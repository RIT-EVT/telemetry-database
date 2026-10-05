from flask.views import MethodView
from flask import request
from bson import ObjectId
from utils import validate_user
import query_scripts.query_utils as query_utils


class QueryManagement(MethodView):
    def __init__(self, db):
        self.db = db

    def delete(self):
        # TODO Eventually convert this from a delete system to an inactive system
        auth_token = request.args.get("auth_token")
        doc_id = request.args.get("doc_id")

        if auth_token is None or doc_id is None:
            return {"error": "Missing auth_token or doc_id"}, 400

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        if not query_utils.validate_id(self.db, doc_id):
            return {"error": "No query found"}, 404

        self.db["custom-queries"].delete_one({"_id": ObjectId(doc_id)})
        return "", 204

    def get(self):
        """
        List queries. ?finished=false (default) -> incomplete only,
        ?finished=true -> finished only, ?finished=all -> everything.
        """
        auth_token = request.args.get("auth_token")
        if auth_token is None:
            return {"error": "Missing auth_token"}, 400

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        finished = request.args.get("finished", "false").lower()
        if finished == "all":
            mongo_filter = {}
        elif finished == "true":
            mongo_filter = {"query-finished": True}
        else:
            mongo_filter = {"query-finished": {"$ne": True}}

        docs = self.db["custom-queries"].find(mongo_filter)
        return {"queries": [query_utils.serialize_query(d) for d in docs]}, 200