from flask.views import MethodView
from utils import validate_user
from http_codes import HttpResponseType
from flask import request
from json import loads, dumps
from bson import ObjectId


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
        if not self.validate_id(doc_id):
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
                return self.test_query(request.get_json()), 200
            case "save-event-query":
                return self.save_event_query(request.get_json(), doc_id)

    def test_query(self, data):

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

        facets = {}

        match_date = {}
        match_name = {}
        match_location = {}

        if "dateRange" in data:

            # parse date from a string to a json object
            dateRange = loads(data["dateRange"])

            match_date = {
                "event.date": {
                    "$gte": dateRange["start"],
                    "$lt": dateRange["end"],
                }
            }
            facets["matchDate"] = [
                {"$match": match_date},
                *format,
            ]

        if "eventName" in data:
            match_name = {"event.name": data["eventName"]}
            facets["matchName"] = [
                {"$match": match_name},
                *format,
            ]

        if "eventLocation" in data:
            match_location = {"event.location": data["eventLocation"]}
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

        cursor = self.db["messages"].aggregate(pipeline, allowDiskUse=True)

        return next(cursor, None)

    def save_event_query(self, data, doc_id):
        pipeline, fields = EventFilterApi.construct_query(data)
        db_connection = self.db["custom-queries"]
        pipeline_string = dumps(pipeline)

        custom_query = {
            "query-body": pipeline_string,
            "event-fields": fields,
            "query-finished": False,
            "query-name": "\0",
        }

        if not self.validate_id(doc_id):
            result = db_connection.insert_one(custom_query)
            document_id = str(result.inserted_id)
            return {"document_id": document_id}, 201

        else:
            db_connection.update_one(
                {"_id": ObjectId(doc_id)},
                {"$push": {"queries": custom_query}},  # specify array field
            )

            return {"document_id": doc_id}, 200

    @staticmethod
    def construct_query(data):

        pipeline = [{"$match": {}}]
        queryFields = {}

        for key in data.keys():
            match key:
                case "dateRange":
                    data_key_value = loads(data[key])

                    pipeline[0]["$match"]["event.date"] = {
                        "$gte": data_key_value["start"],
                        "$lt": data_key_value["end"],
                    }
                    queryFields[key] = (
                        f"{data_key_value["start"]}-{data_key_value["end"]}"
                    )

                    break
                case "eventName":
                    pipeline[0]["$match"]["event.name"] = data[key]
                    queryFields[key] = data[key]
                    break
                case "eventLocation":
                    pipeline[0]["$match"]["event.location"] = data[key]
                    queryFields[key] = data[key]
                    break

        return pipeline, queryFields

    def validate_id(self, doc_id):
        return (
            ObjectId.is_valid(doc_id)
            and self.db["custom-queries"].find_one({"_id": ObjectId(doc_id)})
            is not None
        )
