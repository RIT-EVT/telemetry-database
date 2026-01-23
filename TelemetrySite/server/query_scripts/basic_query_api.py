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
        facets = {}

        match_date = {}
        match_name = {}
        match_location = {}

        if "dateRange" in data:
            match_date = {
                "event.date": {
                    "$gte": data["dateRange"]["start"],
                    "$lt": data["dateRange"]["end"]
                }
            }
            facets["matchDate"] = [
                { "$match": match_date },
                { "$group": { "_id": "$event.name" } },
                { "$count": "count" }
            ]

        if "eventName" in data:
            match_name = {
                "event.name": data["eventName"]
            }
            facets["matchName"] = [
                { "$match": match_name },
                { "$group": { "_id": "$event.name" } },
                { "$count": "count" }
            ]

        if "eventLocation" in data:
            match_location = {
                "event.location": data["eventLocation"]
            }
            facets["matchLocation"] = [
                { "$match": match_location },
                { "$group": { "_id": "$event.name" } },
                { "$count": "count" }
            ]

        match_all = {}
        match_all.update(match_date)
        match_all.update(match_name)
        match_all.update(match_location)

        facets["matchAll"] = [
            { "$match": match_all },
            { "$group": { "_id": "$event.name" } },
            { "$count": "count" }
        ]

        pipeline = [
            { "$facet": facets }
        ]

        result = list(self.db["messages"].aggregate(pipeline, allowDiskUse=True))
        print(result)
        
        return result

    @staticmethod
    def construct_query(data):
        
        pipeline = [
            {
                "$match": {}
            }
        ]
        
        for key in data.keys():
            match key:
                case "dateRange":
                    pipeline[0]["$match"]["event.date"]={
                                    "$gte": data[key]["start"],
                                    "$lt": data[key]["end"]
                                }       
                case "eventName":
                        pipeline[0]["$match"]["event.name"]=data[key]       
                case "eventLocation":
                        pipeline[0]["$match"]["event.location"]=data[key]   

        return pipeline