from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
from data_upload_scripts.data_upload_api import DataUploadApi
from bike_config_scripts.bike_conifg_api import BikeConfigApi
from user_auth_scripts.user_auth_api import UserAuthApi
import os
import logging

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router
CORS(app)
log = logging.getLogger('werkzeug')

# create views for url rules

user_view = DataUploadApi.as_view("DateUploadApi")


app.add_url_rule(
    "/DataUpload/<auth_token>",
    view_func=user_view,
    methods=["GET", "POST"],
)

user_view =BikeConfigApi.as_view("BikeConfigApi")

app.add_url_rule("/ConfigData/<auth_token>", view_func = user_view, methods=["GET", "POST", "DELETE"])

user_view = UserAuthApi.as_view("UserAuthApi")

app.add_url_rule("/Login", view_func=user_view, methods=["POST"])
file_path = os.path.dirname(__file__)
## Get all the url paths
#
# @return JSON file of path values
@app.route("/")
def MainContext():
    # Open the JSON file and load its contents
    try:
        with open(os.path.join(file_path, "ServerPaths.json"), "r") as json_file:
            data = json.load(json_file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding JSON"}), 500


if __name__ == "__main__":
    # credential file exists two levels up
    # from the current file
    
    two_up = os.path.dirname(os.path.dirname(file_path))
    dotenv.load_dotenv(two_up + "/credentials.env")
    print("Starting flask")

    app.run(debug=True)  # Starts Flask
