# server.py
from flask import Flask, jsonify, make_response, redirect, request, session, url_for
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
import os
import logging

# your existing API views
from data_upload_scripts.data_upload_api import DataUploadApi
from bike_config_scripts.bike_conifg_api import BikeConfigApi
from user_auth_scripts.saml_auth import saml_bp


app = Flask(__name__)
api = Api(app)
CORS(app)
log = logging.getLogger('werkzeug')
app.register_blueprint(saml_bp)

# load credentials.env (two levels up from this file)
two_up = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
dotenv_path = os.path.join(two_up, "credentials.env")
if os.path.exists(dotenv_path):
    dotenv.load_dotenv(dotenv_path)

# Register your RESTful endpoints (unchanged)
app.add_url_rule("/api/DataUpload/<auth_token>", view_func=DataUploadApi.as_view("DataUploadApi"), methods=["GET", "POST"])
app.add_url_rule("/api/ConfigData/<auth_token>", view_func=BikeConfigApi.as_view("BikeConfigApi"), methods=["GET", "POST", "DELETE"])

file_path = os.path.dirname(__file__)

@app.route("/api/")
def MainContext():
    try:
        with open(os.path.join(file_path, "ServerPaths.json"), "r") as json_file:
            data = json.load(json_file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding JSON"}), 500

if __name__ == "__main__":
    # dev server - in prod use gunicorn/uwsgi behind HTTPS
    app.run(host="127.0.0.1", port=5000, debug=True)
