from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
from data_upload_scripts.data_upload_api import DateUploadApi
import urllib
import os
import logging

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router
CORS(app)
log = logging.getLogger('werkzeug')
# Set the desired log level (e.g., ERROR or CRITICAL)
# Currently set to only print if something goes wrong internally
# Does not display every call
log.setLevel(logging.ERROR)

# create views for url rules

user_view = DateUploadApi.as_view("DateUploadApi")


app.add_url_rule(
    "/DataUpload",
    view_func=user_view,
    methods=["GET", "POST", "PUT"],
)

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
