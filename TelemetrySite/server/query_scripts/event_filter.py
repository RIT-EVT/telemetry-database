from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import dumps
from bson import ObjectId
import query_scripts.query_utils as query_utils


class EventFilterApi(MethodView):
    def __init__(self, db):
        self.db = db

    def get(self):
        # Get the fields from a document for event filtering
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        # ID isn't an ID or it doesn't correspond to a doc in the db
        if not query_utils.validate_id(self.db, doc_id):
            return HttpResponseType.BAD_REQUEST.error()

        self.db["custom"]

    def post(self):
        # Add or test a query against the DB
        mode = request.args.get("mode")
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        match mode:
            case "test-query":
                return self.test_query(request.get_json(), doc_id)
            case "save-event-query":
                return self.save_event_query(request.get_json(), doc_id)

    def test_query(self, data, doc_id):

        # Format for our data portion of the aggregate pipeline for all facets
        format = [
            {
                "$group": {
                    "_id": "$event.name",
                    "date": {"$first": "$event.date"},
                    "location": {"$first": "$event.location"},
                }
            },
            {
                "$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "events": {
                        "$push": {
                            "name": "$_id",
                            "date": "$date",
                            "location": "$location",
                        }
                    },
                }
            },
            {"$project": {"_id": 0, "count": 1, "events": 1}},
        ]

        event_data = data["query_event"]

        facets = {}

        match_date = {}
        match_name = {}
        match_location = {}
        query_name = data["query_name"]  

        if "event_start_date" in event_data and "event_end_date" in event_data:
            match_date = {
        "event.date": {
            "$gte": event_data["event_start_date"],
            "$lt": event_data["event_end_date"],
        }
    }
            facets["matchDate"] = [
        {"$match": match_date},
        *format,
    ]

        if "event_name" in event_data:
            match_name = {"event.name": event_data["event_name"]}
            facets["matchName"] = [
        {"$match": match_name},
        *format,
    ]

        if "event_location" in event_data:
            match_location = {"event.location": event_data["event_location"]}
            facets["matchLocation"] = [
                {"$match": match_location},
                *format,
            ]

        match_all = {}
        match_all.update(match_date)
        match_all.update(match_name)
        match_all.update(match_location)

        facets["matchFinal_Result"] = [{"$match": match_all}, *format]

        pipeline = [
            {"$facet": facets},
            # So this is two messy entries, but they serve an important role
            # facets inherently return and array of documents, but our pipeline compresses it down to 1
            # these two queries take all the facets, strip them of the documents, and changes it to a single
            {
                "$project": {
                    "_id": 0,
                    "facets": {
                        "$arrayToObject": {
                            "$map": {
                                "input": {"$objectToArray": "$$ROOT"},
                                "as": "facet",
                                "in": {
                                    "k": "$$facet.k",
                                    "v": {
                                        "$ifNull": [
                                            {"$arrayElemAt": ["$$facet.v", 0]},
                                            {"count": 0, "events": []},
                                        ]
                                    },
                                },
                            }
                        }
                    },
                }
            },
            {"$replaceRoot": {"newRoot": "$facets"}},
        ]

        response = list(self.db["messages"].aggregate(pipeline, allowDiskUse=True))[0]
        name_valid: bool = True
        duplicate = query_utils.check_duplicate_query_name(self.db, query_name, doc_id)
        if query_name == "" or duplicate:
            name_valid = False

        return {
            "query_data": response,
            "query_name": {
                "name_passed": query_name != "",
                "name_valid": name_valid,
                "name": query_name,
            },
        }, 200

    def save_event_query(self, data, doc_id):
        pipeline, fields = query_utils.construct_event_query(data)
        query_name = data["query_name"]
        db_connection = self.db["custom-queries"]
        pipeline_string = dumps(pipeline)
        
        document = query_utils.get_valid_doc(self.db, doc_id)

        # Check if a query already exists with a given name
        # Return an error if one does exist that isn't the one currently being edited
        if query_utils.check_duplicate_query_name(self.db, query_name, doc_id):
            return {"invalid": "duplicate query name detected"}, 409

        if document is None:  # Create a new query
            custom_query = {
                "query-body": pipeline_string,
                "query-event-body": pipeline_string,
                "event-fields": fields,
                "query-finished": False,
                "query-name": query_name,
                "query_js_body": data
            }
            result = db_connection.insert_one(custom_query)
            document_id = str(result.inserted_id)

            return {"document_id": document_id}, 201

        else:  # Update an existing custom query

            db_connection.update_one(
                {"_id": ObjectId(doc_id)},
                {
                    "$set": {
                        "query-body": pipeline_string,
                        "query-event-body": pipeline_string,
                        "event-fields": fields,
                        "query-name": query_name,
                        "query_js_body": data
                    }
                },
            )   

            return {"document_id": doc_id}, 200
