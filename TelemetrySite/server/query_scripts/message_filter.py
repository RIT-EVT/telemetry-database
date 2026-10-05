from flask.views import MethodView
from flask import request
from json import loads, dumps
from bson import ObjectId
from utils import validate_user
import query_scripts.query_utils as query_utils


class MessageFilterApi(MethodView):
    def __init__(self, db):
        self.db = db

    def get(self):
        """Return every signal name found in events matching the saved event query."""
        auth_token = request.args.get("auth_token")
        doc_id = request.args.get("doc_id")

        if auth_token is None or doc_id is None:
            return {"error": "Missing auth_token or doc_id"}, 400

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        if not ObjectId.is_valid(doc_id):
            return {"error": "Invalid ID"}, 400

        document = query_utils.get_valid_doc(self.db, doc_id)
        if document is None:
            return {"error": "No document found"}, 404

        pipeline = loads(document["query-event-body"]) + [
            {"$group": {"_id": None, "signals": {"$push": "$event.run.signals"}}},
            {
                "$project": {
                    "signals": {
                        "$reduce": {
                            "input": "$signals",
                            "initialValue": [],
                            "in": {"$concatArrays": ["$$value", "$$this"]},
                        }
                    }
                }
            },
        ]

        result = list(self.db["messages"].aggregate(pipeline, allowDiskUse=True))
        signals = result[0].get("signals", []) if result else []
        # Deduplicate while preserving order
        return {"response": list(dict.fromkeys(signals))}, 200

    def post(self):
        """Attach the message (signal) filter stage to an existing event query."""
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        query_doc = query_utils.get_valid_doc(self.db, doc_id)
        if query_doc is None:
            return {"error": "Query doc not found"}, 404

        data = request.get_json(silent=True) or {}
        can_names = data.get("query_data", {}).get("can_name", [])
        query_name = data.get("query_name", "")

        if not isinstance(can_names, list) or len(can_names) == 0:
            return {"error": "At least one CAN signal name is required"}, 400
        if query_name == "":
            return {"error": "Query name is required"}, 400
        if query_utils.check_duplicate_query_name(self.db, query_name, doc_id):
            return {"invalid": "duplicate query name detected"}, 409

        event_body = loads(query_doc["query-event-body"])
        message_filter_stages = [
            {"$unwind": "$event.run.messages"},
            {"$match": {"event.run.messages.signal": {"$in": can_names}}},
            {"$group": {"_id": "$_id", "messages": {"$push": "$event.run.messages"}}},
        ]

        self.db["custom-queries"].update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$set": {
                    "query-body": dumps(event_body + message_filter_stages),
                    "query-message-body": dumps(message_filter_stages),
                    "query-name": query_name,
                    "query_js_body": data,
                }
            },
        )
        return {"document_id": doc_id}, 201