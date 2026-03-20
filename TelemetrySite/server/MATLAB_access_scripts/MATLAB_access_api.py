from json import loads
from flask import request

from flask import Flask, jsonify
from flask_restful import Api
from flask.views import MethodView
from flask_cors import CORS
import dotenv

from TelemetrySite.server.http_codes import HttpResponseType

class MATLAB_access_api(MethodView):
    def __init__(self, db):
        self.db = db

    def get(self):
        query_name = request.args.get('name')
        if not query_name:
            return {"error": "Missing query name"}, HttpResponseType.BAD_REQUEST.value

        config_col = self.db["configs"]
        config_doc = config_col.find_one({"query-name": query_name})

        if not config_doc:
            return {"error": "Query definition not found"}, HttpResponseType.NOT_FOUND.value

        try:
            pipeline = loads(config_doc["query-body"])

            messages_col = self.db["messages"]
            cursor = messages_col.aggregate(pipeline)

            results = []
            for doc in cursor:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
                results.append(doc)

            return {
                "query": query_name,
                "data": results,
                "count": len(results)
            }, HttpResponseType.OK.value

        except Exception as e:
            return {"error": f"Execution failed: {str(e)}"}, HttpResponseType.INTERNAL_SERVER_ERROR.value