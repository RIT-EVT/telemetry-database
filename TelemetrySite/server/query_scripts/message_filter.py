from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads, dumps
from bson import ObjectId


class MessageFilterApi(MethodView):
    def __init__(self, db):
        self.db = db

    def get(self):
        auth_token = request.args.get("auth_token")
        doc_id = request.args.get("doc_id")

        if auth_token == None or doc_id == None:
            return {
                "error": "Missing auth_token or doc_id"
            }, HttpResponseType.BAD_REQUEST

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()
        elif not ObjectId.is_valid(doc_id):
            return {"error": "Invalid ID"}, HttpResponseType.BAD_REQUEST

        document = self.db["custom-queries"].find_one({"_id": ObjectId(doc_id)})

        if document == None:
            return {"error": "No document found"}, HttpResponseType.BAD_REQUEST

        query_body = loads(document["query-body"])

        # Combine the signals for all the events matching the first stage
        # Unique signal names are cached during upload
        new_query = [
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

        query_body += new_query

        query_response = list(
            self.db["messages"].aggregate(query_body, allowDiskUse=True)
        )

        if query_response.__len__() > 0 and "signals" in query_response[0]:
            return {"response": query_response[0]["signals"]}, HttpResponseType.OK
        else:
            return {"response": []}, HttpResponseType.OK

    def post(self):
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()
        elif not ObjectId.is_valid(doc_id):
            return {"error": "Invalid ID"}, HttpResponseType.BAD_REQUEST

        data = request.get_json()
        
        # Extract CAN signal names from request

        can_names = data.get("query_data", {}).get("can_name", [])
        query_name = data.get("query_name", "")

        # Fetch the existing query doc
        query_doc = self.db["custom-queries"].find_one({"_id": ObjectId(doc_id)})
        if not query_doc:
            return {"error": "Query doc not found"}, 404

        # Get the existing pipeline stages (already built for event filtering)
        event_body = loads(query_doc["query-event-body"])
        # Append stages to unwind and filter messages by signalName
        message_filter_stages = [
            {"$unwind": "$event.run.messages"},
            {"$match": {"event.run.messages.signal": {"$in": can_names}}},
            {"$group": {"_id": "$_id", "messages": {"$push": "$event.run.messages"}}},
        ]
        full_pipeline = event_body + message_filter_stages
        full_pipeline = dumps(full_pipeline)

        # Update the query doc with the completed pipeline
        self.db["custom-queries"].update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$set": {
                    "query-body": full_pipeline,
                    "query-name": query_name,
                    "query_js_body": data,
                }
            },
        )

        return 201
