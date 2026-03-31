from bson import ObjectId

def check_duplicate_query_name(db, query_name: str, doc_id: str):
        """
        Get if a query name already exists in a document that is not this one.
        Returns True if the name is a duplicate
        """
        db_connection = db["custom-queries"]

        matching_document = db_connection.find_one({"query-name": query_name})

        if matching_document is not None and (
            not validate_id(db, doc_id) or matching_document["_id"] !=ObjectId(doc_id)
        ):
            return True
        return False


def validate_id(db, doc_id):
        return (
            ObjectId.is_valid(doc_id)
            and db["custom-queries"].find_one({"_id": ObjectId(doc_id)})
            is not None
        )

def get_valid_doc(db, doc_id):
    if validate_id(db, doc_id):
        return db["custom-queries"].find_one({"_id": ObjectId(doc_id)})
    else: 
        return None

def construct_event_query(data):

        pipeline = [{"$match": {}}]
        queryFields = {}

        event_data = data.get("query_event", {})

        if "event_start_date" in event_data and "event_end_date" in event_data:
            pipeline[0]["$match"]["event.date"] = {
                "$gte": event_data["event_start_date"],
                "$lt": event_data["event_end_date"],
            }
            queryFields["dateRange"] = f"{event_data['event_start_date']}-{event_data['event_end_date']}"

        if "event_name" in event_data:
            pipeline[0]["$match"]["event.name"] = event_data["event_name"]
            queryFields["eventName"] = event_data["event_name"]

        if "event_location" in event_data:
            pipeline[0]["$match"]["event.location"] = event_data["event_location"]
            queryFields["eventLocation"] = event_data["event_location"]

        return pipeline, queryFields