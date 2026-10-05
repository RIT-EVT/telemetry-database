from bson import ObjectId


def validate_id(db, doc_id) -> bool:
    """True if doc_id is a valid ObjectId that matches a custom query document."""
    return get_valid_doc(db, doc_id) is not None


def get_valid_doc(db, doc_id):
    """Return the custom-query document for doc_id, or None."""
    if doc_id is None or not ObjectId.is_valid(doc_id):
        return None
    return db["custom-queries"].find_one({"_id": ObjectId(doc_id)})


def check_duplicate_query_name(db, query_name: str, doc_id: str) -> bool:
    """
    True if another document (not the one identified by doc_id) already
    uses this query name.
    """
    matching = db["custom-queries"].find_one({"query-name": query_name})
    if matching is None:
        return False
    if doc_id is None or not ObjectId.is_valid(doc_id):
        return True
    return matching["_id"] != ObjectId(doc_id)


def serialize_query(doc: dict) -> dict:
    """Convert a custom-query document into a JSON-safe dict."""
    return {
        "document_id": str(doc["_id"]),
        "query_name": doc.get("query-name", ""),
        "query_finished": doc.get("query-finished", False),
        "event_fields": doc.get("event-fields", {}),
        "query_js_body": doc.get("query_js_body", {}),
        "has_message_filter": bool(doc.get("query-message-body")),
    }


def construct_event_query(data):
    pipeline = [{"$match": {}}]
    query_fields = {}

    event_data = data.get("query_event", {})

    if "event_start_date" in event_data and "event_end_date" in event_data:
        pipeline[0]["$match"]["event.date"] = {
            "$gte": event_data["event_start_date"],
            "$lt": event_data["event_end_date"],
        }
        query_fields["dateRange"] = (
            f"{event_data['event_start_date']}-{event_data['event_end_date']}"
        )

    if "event_name" in event_data:
        pipeline[0]["$match"]["event.name"] = event_data["event_name"]
        query_fields["eventName"] = event_data["event_name"]

    if "event_location" in event_data:
        pipeline[0]["$match"]["event.location"] = event_data["event_location"]
        query_fields["eventLocation"] = event_data["event_location"]

    return pipeline, query_fields