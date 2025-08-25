# server.py
from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
import os
import logging

from data_upload_scripts.data_upload_api import DataUploadApi
from bike_config_scripts.bike_conifg_api import BikeConfigApi
from user_auth_scripts.user_auth_api import UserAuthApi


def create_app():
    app = Flask(__name__)
    api = Api(app)
    CORS(app)
    log = logging.getLogger("werkzeug")

    # Load credentials
    server_folder=os.path.dirname(__file__)
    two_up = os.path.dirname(os.path.dirname(server_folder))
    dotenv.load_dotenv(os.path.join(two_up, "credentials.env"))
    dotenv.load_dotenv(os.path.join(two_up, "encryption.env"))

    # Register routes
    api.add_resource(DataUploadApi, "/DataUpload/<auth_token>")
    api.add_resource(BikeConfigApi, "/ConfigData/<auth_token>")
    api.add_resource(UserAuthApi, "/Login")

    @app.route("/")
    def MainContext():
        
        try:
            with open(os.path.abspath(os.path.join(server_folder, "ServerPaths.json")), "r") as json_file:
                data = json.load(json_file)
            return jsonify(data), 200
        except FileNotFoundError:
            return jsonify({"error": "File not found"}), 404
        except json.JSONDecodeError:
            return jsonify({"error": "Error decoding JSON"}), 500

    return app


if __name__ == "__main__":
    print("Starting flask")
    app = create_app()
    app.run(debug=True)
