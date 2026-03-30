from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads
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
