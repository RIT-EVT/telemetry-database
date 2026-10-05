import re
from json import loads, dumps
from flask import request
from flask.views import MethodView
from bson import ObjectId, json_util
from utils import validate_user
import query_scripts.query_utils as query_utils

# Field paths may not start with "$", so users cannot inject operators like $where
FIELD_PATH = re.compile(r"^[A-Za-z_][A-Za-z0-9_\-]*(\.[A-Za-z0-9_\-]+)*$")
OUTPUT_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
ACCUMULATORS = {"sum", "count", "avg", "min", "max", "first", "last", "push", "addToSet"}
MAX_STAGES = 20
MAX_SAMPLE_SIZE = 1000
TEST_TIMEOUT_MS = 30000


class QueryValidationError(Exception):
    pass


def _path(value) -> str:
    if not isinstance(value, str) or not FIELD_PATH.match(value.strip()):
        raise QueryValidationError(f"Invalid field path: {value!r}")
    return value.strip()


def _scalar(raw):
    """Parse a user supplied match value. Only scalars are allowed (no operator objects)."""
    if isinstance(raw, str):
        try:
            raw = loads(raw)
        except ValueError:
            return raw  # Plain text, e.g. an event name
    if raw is None or isinstance(raw, (str, int, float, bool)):
        return raw
    raise QueryValidationError("Match values must be text, numbers, booleans or null")


def build_stage(stage: dict) -> dict:
    stage_type = stage.get("type")
    params = stage.get("params", [])
    if not isinstance(params, list) or not all(isinstance(p, dict) for p in params):
        raise QueryValidationError("Stage parameters are malformed")
    if not params:
        raise QueryValidationError(f"{stage_type} stage needs at least one parameter")

    if stage_type == "Match":
        return {"$match": {_path(p.get("Field Path")): _scalar(p.get("Value", "")) for p in params}}

    if stage_type == "Unwind":
        return {"$unwind": "$" + _path(params[0].get("Field Path"))}

    if stage_type == "Sample":
        try:
            size = int(params[0].get("Size", ""))
        except (TypeError, ValueError):
            raise QueryValidationError("Sample size must be a whole number")
        if not 1 <= size <= MAX_SAMPLE_SIZE:
            raise QueryValidationError(f"Sample size must be between 1 and {MAX_SAMPLE_SIZE}")
        return {"$sample": {"size": size}}

    if stage_type == "Sort":
        sort = {}
        for p in params:
            direction = p.get("Direction")
            if direction not in ("asc", "desc"):
                raise QueryValidationError("Sort direction must be asc or desc")
            sort[_path(p.get("Field Path"))] = 1 if direction == "asc" else -1
        return {"$sort": sort}

    if stage_type == "Group":
        group = {}
        for p in params:
            name = p.get("Output Name", "")
            if name == "_id":
                field = (p.get("Field Path") or "").strip()
                group["_id"] = "$" + _path(field) if field else None
                continue
            if not isinstance(name, str) or not OUTPUT_NAME.match(name):
                raise QueryValidationError(f"Invalid output name: {name!r}")
            operation = p.get("Operation")
            if operation not in ACCUMULATORS:
                raise QueryValidationError(f"Unsupported group operation: {operation!r}")
            if operation == "count":
                group[name] = {"$sum": 1}
            else:
                group[name] = {"$" + operation: "$" + _path(p.get("Field Path"))}
        group.setdefault("_id", None)
        return {"$group": group}

    raise QueryValidationError(f"Unsupported stage type: {stage_type!r}")


def build_pipeline(data: dict) -> list:
    stages = data.get("stages")
    if not isinstance(stages, list) or not 1 <= len(stages) <= MAX_STAGES:
        raise QueryValidationError(f"A query needs between 1 and {MAX_STAGES} stages")
    if not all(isinstance(s, dict) for s in stages):
        raise QueryValidationError("Stages are malformed")
    return [build_stage(s) for s in stages]


class AdvancedQueryApi(MethodView):
    def __init__(self, db):
        self.db = db

    def post(self):
        mode = request.args.get("mode")
        doc_id = request.args.get("doc_id")
        auth_token = request.args.get("auth_token")

        user_valid, response = validate_user(auth_token, self.db)
        if not user_valid:
            return response.error()

        data = request.get_json(silent=True) or {}
        try:
            pipeline = build_pipeline(data)
        except QueryValidationError as err:
            return {"error": str(err)}, 400

        match mode:
            case "test-query":
                return self.test_query(pipeline)
            case "save-query":
                return self.save_query(data, pipeline, doc_id)
            case _:
                return {"error": "Invalid mode"}, 400

    def test_query(self, pipeline):
        messages = self.db["messages"]
        count_result = list(
            messages.aggregate(
                pipeline + [{"$count": "n"}], allowDiskUse=True, maxTimeMS=TEST_TIMEOUT_MS
            )
        )
        sample = list(
            messages.aggregate(
                pipeline + [{"$limit": 5}], allowDiskUse=True, maxTimeMS=TEST_TIMEOUT_MS
            )
        )
        count = count_result[0]["n"] if count_result else 0
        # json_util handles ObjectId / datetime values
        return loads(json_util.dumps({"count": count, "sample": sample})), 200

    def save_query(self, data, pipeline, doc_id):
        query_name = (data.get("query_name") or "").strip()
        if query_name == "":
            return {"error": "Query name is required"}, 400
        if query_utils.check_duplicate_query_name(self.db, query_name, doc_id):
            return {"invalid": "duplicate query name detected"}, 409

        collection = self.db["custom-queries"]
        fields = {
            "query-body": dumps(pipeline),
            "query-event-body": "",
            "query-message-body": "",
            "event-fields": {},
            "query-finished": True,  # Advanced queries have no later steps
            "query-name": query_name,
            "query-type": "advanced",
            "query_js_body": data,
        }

        document = query_utils.get_valid_doc(self.db, doc_id)
        # Only update the document if it is an advanced query; never overwrite a basic one
        if document is not None and document.get("query-type") == "advanced":
            collection.update_one({"_id": ObjectId(doc_id)}, {"$set": fields})
            return {"document_id": doc_id}, 200

        result = collection.insert_one(fields)
        return {"document_id": str(result.inserted_id)}, 201