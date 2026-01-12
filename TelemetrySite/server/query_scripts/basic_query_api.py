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
        query = self.construct_query(data)
        query.append({"$group":{
            "_id":"$event.name",
            "count": { "$sum": 1 }
        }})

        result = {}

        if "dateRange" in data:
            temp_pipeline = [
                {
                    "$match": {
                        "event.date": {
                            "$gte": data["dateRange"]["start"],
                            "$lt": data["dateRange"]["end"]
                        }
                    }
                },
                {
                    "$group": {
                        "_id": "$event.name",
                        "count": { "$sum": 1 }
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "eventName": "$_id",
                        "count": 1
                    }
                }
            ]


            result["dateResult"] = list(self.db["messages"].aggregate(temp_pipeline, allowDiskUse=True))

        print(query)

        query.append({ "$count": "total" })
        list(self.db["messages"].aggregate(query, allowDiskUse=True))
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