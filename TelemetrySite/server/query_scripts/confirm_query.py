from flask.views import MethodView
from flask import request
from bson import ObjectId
from utils import validate_user
import query_scripts.query_utils as query_utils


class ConfirmQueryApi(MethodView):
    def __init__(self, db):
        self.db = db

    def post(self):
        """Mark a query as finished so it becomes available for use."""
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        document = query_utils.get_valid_doc(self.db, doc_id)
        if document is None:
            return {"error": "No query found"}, 404

        # A query must have both an event stage and a message stage to be finished
        if not document.get("query-event-body") or not document.get(
            "query-message-body"
        ):
            return {"error": "Query is incomplete"}, 400

        self.db["custom-queries"].update_one(
            {"_id": ObjectId(doc_id)}, {"$set": {"query-finished": True}}
        )
        return {"document_id": doc_id, "query_finished": True}, 200