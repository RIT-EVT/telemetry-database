from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
from context_scripts.context_api import ContextApi
from data_upload_scripts.data_upload_api import DateUploadApi
from event_api_scripts.event_api import EventApi
from data_upload_scripts.data_organization import organize_can_from_db

import os

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router
CORS(app)

# create views for url rules
user_view = ContextApi.as_view("ContextApi")

app.add_url_rule(
    "/Context", view_func=user_view, methods=["GET", "PUT", "DELETE", "POST"]
)
user_view = DateUploadApi.as_view("DateUploadApi")
# TODO Look at refactoring this later
# I don't love that data upload is in charge of
# the progress, shift instead to its own call
# and use data to return data from db based
# off the context id
app.add_url_rule(
    "/DataUpload/<contextId>",
    view_func=user_view,
    methods=["GET", "POST"],
)
user_view = EventApi.as_view("EventApi")
app.add_url_rule("/Event/<contextId>", view_func=user_view, methods=["GET"])


## Get all the url paths
#
# @return JSON file of path values
@app.route("/")
def MainContext():
    # Open the JSON file and load its contents
    try:
        with open("ServerPaths.json", "r") as json_file:
            data = json.load(json_file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding JSON"}), 500


if __name__ == "__main__":
    # credential file exists two levels up
    # from the current file
    two_up = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    dotenv.load_dotenv(two_up + "/credentials.env")
    print("Starting flask")

    app.run(debug=True)  # Starts Flask
