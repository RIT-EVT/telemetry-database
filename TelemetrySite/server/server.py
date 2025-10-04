from flask import Flask, jsonify, make_response, redirect, request, session
from flask_restful import Api
from flask_cors import CORS
import dotenv
import json
from data_upload_scripts.data_upload_api import DataUploadApi
from bike_config_scripts.bike_conifg_api import BikeConfigApi
from user_auth_scripts.user_auth_api import UserAuthApi
import os
import logging
from saml2.client import Saml2Client
import saml2
import subprocess
import xml.etree.ElementTree as ET

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router
CORS(app)
log = logging.getLogger('werkzeug')

DIR = os.path.dirname(__file__)
saml_config_path=os.path.join(DIR, "user_auth_scripts/sp_config.py")

saml_client = Saml2Client(config_file=saml_config_path)


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


# login example
@app.route("/saml2/login")
def login():
    _, info = saml_client.prepare_for_authenticate()
    headers = dict(info['headers'])
    # Remove Location header and create a redirect response with it
    response = redirect(headers.pop('Location'), code=302)
    # Copy the rest of the SAML headers to the response
    for name, value in headers.items():
        response.headers[name] = value
        
    return response
# end login example

# acs example
@app.route("/saml2/acs", methods=['POST'])
def acs():
    authn_response = saml_client.parse_authn_request_response(
        request.form['SAMLResponse'],
        saml2.entity.BINDING_HTTP_POST,
    )
    if not authn_response:
        return "Bad SAMLResponse", 500

    session['saml_identity'] = authn_response.get_identity()
    return redirect('saml.index')  
# end acs example


# metadata example
cached_metadata = None
@app.route("/saml2/metadata")
def metadata():
    global cached_metadata
    if not cached_metadata:
        cmd = subprocess.run(
            ["make_metadata", saml_config_path], 
            stdout=subprocess.PIPE, 
            check=True, 
            text=True
        )
        
        metadata = ET.XML(cmd.stdout)
        ET.indent(metadata)
        cached_metadata = ET.tostring(metadata, encoding='unicode')

    response = make_response(cached_metadata)
    response.headers['Content-Type'] = 'text/xml'
    return response
# end metadata example

if __name__ == "__main__":
    # credential file exists two levels up
    # from the current file
    
    two_up = os.path.dirname(os.path.dirname(file_path))
    dotenv.load_dotenv(two_up + "/credentials.env")
    print("Starting flask")

    app.run(debug=True)  # Starts Flask
