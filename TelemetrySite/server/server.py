# server.py
from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
import os
from MATLAB_access_scripts.MATLAB_access_api import MATLAB_access_api
from http_codes import HttpResponseType

from sys import argv


from data_upload_scripts.data_upload_api import DataUploadApi
from bike_config_scripts.bike_config_api import BikeConfigApi
from user_auth_scripts.user_auth_api import UserAuthApi
from query_scripts.event_filter import EventFilterApi
from query_scripts.message_filter import MessageFilterApi
from query_scripts.confirm_query import ConfirmQueryApi
import utils
from development_mode import create_false_db_instance


def create_app(db=None):
    app = Flask(__name__)
    api = Api(app)
    CORS(app)
    server_folder = os.path.dirname(__file__)

    # Load credentials
    if len(argv) < 2 or argv[1] == "production":
        print("creating real DB instance")
        print(len(argv))
        two_up = os.path.dirname(os.path.dirname(server_folder))
        dotenv.load_dotenv(os.path.join(two_up, "credentials.env"))
        db = utils.create_db_connection()
    else:
        db = create_false_db_instance()

    # Register routes with DB injected
    api.add_resource(
        DataUploadApi, "/DataUpload/<auth_token>", resource_class_kwargs={"db": db}
    )
    api.add_resource(
        BikeConfigApi, "/ConfigData/<auth_token>", resource_class_kwargs={"db": db}
    )
    api.add_resource(UserAuthApi, "/Login", resource_class_kwargs={"db": db})
    api.add_resource(
        EventFilterApi,
        "/EventFilter",
        resource_class_kwargs={"db": db},
    )
    api.add_resource(
        MessageFilterApi,
        "/MessageFilter",
        resource_class_kwargs={"db": db},
    )
    api.add_resource(MATLAB_access_api, "/MATLAB", resource_class_kwargs={"db": db})
    api.add_resource(ConfirmQueryApi, "/ConfirmQuery", resource_class_kwargs={"db": db})

    @app.route("/")
    def MainContext():
        try:
            with open(
                os.path.abspath(os.path.join(server_folder, "ServerPaths.json")), "r"
            ) as json_file:
                data = json.load(json_file)
            return jsonify(data), HttpResponseType.OK.value
        except FileNotFoundError:
            return (
                jsonify({"error": "File not found"}),
                HttpResponseType.INTERNAL_SERVER_ERROR.value,
            )
        except json.JSONDecodeError:
            return (
                jsonify({"error": "Error decoding JSON"}),
                HttpResponseType.INTERNAL_SERVER_ERROR.value,
            )

    return app


if __name__ == "__main__":
    print("Starting flask")
    app = create_app()  # real DB in production, don't pass in a connection
    app.run(debug=True)
