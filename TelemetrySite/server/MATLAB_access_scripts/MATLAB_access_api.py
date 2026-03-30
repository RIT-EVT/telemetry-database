from json import loads
from flask import request

from flask import Flask, jsonify
from flask_restful import Api
from flask.views import MethodView
from flask_cors import CORS

from http_codes import HttpResponseType
from bson import ObjectId

class MATLAB_access_api(MethodView):
    def __init__(self, db):
        self.db = db

    def serialize_doc(self, doc):
        """Recursively convert ObjectId and other non-serializable types to strings."""
        if isinstance(doc, dict):
            return {k: self.serialize_doc(v) for k, v in doc.items()}
        elif isinstance(doc, list):
            return [self.serialize_doc(i) for i in doc]
        elif isinstance(doc, ObjectId):
            return str(doc)
        return doc

    def get(self):
        query_name = request.args.get('name')
        if not query_name:
            return {"error": "Missing query name"}, HttpResponseType.BAD_REQUEST.value

        config_col = self.db["custom-queries"]
        config_doc = config_col.find_one({"query-name": query_name})

        if not config_doc:
            return {"error": "Query definition not found"}, HttpResponseType.NOT_FOUND.value

        try:
            pipeline = loads(config_doc["query-body"])
            messages_col = self.db["messages"]
            cursor = messages_col.aggregate(pipeline)

            results = [self.serialize_doc(doc) for doc in cursor]

            return {
                "query": query_name,
                "data": results,
                "count": len(results)
            }, HttpResponseType.OK.value

        except Exception as e:
            return {"error": f"Execution failed: {str(e)}"}, HttpResponseType.INTERNAL_SERVER_ERROR.value