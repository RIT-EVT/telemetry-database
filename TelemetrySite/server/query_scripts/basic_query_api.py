from flask.views import MethodView
from utils import authenticate_user, check_expired_tokens
from http_codes import HttpResponseType
from flask import jsonify, request


class BasicQueryApi(MethodView):
    def __init__(self, db):
        self.db = db

    def post(self, auth_token, mode):
        if not authenticate_user(auth_token, self.db):
            return HttpResponseType.UNAUTHORIZED.error()
        elif check_expired_tokens(auth_token, self.db):
            return HttpResponseType.UNAUTHORIZED.error()

        match mode:
            case "test-query":
                return self.test_query(request.get_json()), 200

    def test_query(self, data):

        # Format for our data portion of the aggregate pipeline for all facets
        format = [
            {"$group": {"_id": "$event.name", "date": {"$first": "$event.date"}}},
            {
                "$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "events": {"$push": {"name": "$_id", "date": "$date"}},
                }
            },
            {"$project": {"_id": 0, "count": 1, "events": 1}},
        ]

        facets = {}

        match_date = {}
        match_name = {}
        match_location = {}

        if "dateRange" in data:
            match_date = {
                "event.date": {
                    "$gte": data["dateRange"]["start"],
                    "$lt": data["dateRange"]["end"],
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

        facets["matchAll"] = [{"$match": match_all}, *format]

        pipeline = [
            {"$facet": facets},
            {
                # So this is two messy entries, but they serve an important role
                # facets inherently return and array of documents, but our pipeline compresses it down to 1
                # these two queries take all the facets, strip them of the array, and changes it to an object
                "$project": {
                    "_id": 0,
                    "facets": {
                        "$arrayToObject": {
                            "$map": {
                                "input": {"$objectToArray": "$$ROOT"},
                                "as": "facet",
                                "in": {
                                    "k": "$$facet.k",
                                    "v": {"$arrayElemAt": ["$$facet.v", 0]},
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

    @staticmethod
    def construct_query(data):

        pipeline = [{"$match": {}}]

        for key in data.keys():
            match key:
                case "dateRange":
                    pipeline[0]["$match"]["event.date"] = {
                        "$gte": data[key]["start"],
                        "$lt": data[key]["end"],
                    }
                case "eventName":
                    pipeline[0]["$match"]["event.name"] = data[key]
                case "eventLocation":
                    pipeline[0]["$match"]["event.location"] = data[key]

        return pipeline
