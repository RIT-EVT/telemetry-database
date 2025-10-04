# user_auth_scripts/saml_auth.py
from flask import Blueprint, redirect, request, make_response
from saml2.client import Saml2Client
from saml2.config import Config as Saml2Config
from saml2 import BINDING_HTTP_POST
from user_auth_scripts.sp_config import SAML_CONFIG
from utils import create_db_connection, create_auth_token, update_expired_token
from datetime import datetime

# Blueprint
saml_bp = Blueprint("saml", __name__, url_prefix="/api/saml2")

def get_saml_client():
    cfg = Saml2Config()
    cfg.load(SAML_CONFIG)
    cfg.allow_unknown_attributes = True
    return Saml2Client(config=cfg)

@saml_bp.route("/login")
def saml_login():
    client = get_saml_client()
    try:
        reqid, info = client.prepare_for_authenticate()
        for key, value in info["headers"]:
            if key == "Location":
                return redirect(value)
    except Exception as e:
        return make_response(f"SAML login failed: {str(e)}", 500)
    return make_response("Failed to redirect to IdP", 500)

@saml_bp.route("/acs", methods=["POST"])
def saml_acs():
    client = get_saml_client()
    saml_response = request.form.get("SAMLResponse")
    if not saml_response:
        return make_response("Missing SAMLResponse", 400)

    try:
        authn_response = client.parse_authn_request_response(saml_response, BINDING_HTTP_POST)
        identity = authn_response.get_identity() or {}
        username = identity.get("uid", [None])[0] or identity.get("cn", [None])[0]

        if not username:
            return make_response("No usable username attribute", 400)

        users = create_db_connection()["users"]
        mongo_data = users.find_one({"username": username})

        if mongo_data is None:
            auth_token = create_auth_token()
            users.insert_one({
                "username": username,
                "password": None,
                "auth_token": auth_token,
                "auth_time": datetime.utcnow(),
                "saml_attributes": identity
            })
        else:
            auth_token = update_expired_token(mongo_data["_id"])

        return {"auth_token": auth_token}
    except Exception as e:
        return make_response(f"SAML ACS error: {str(e)}", 500)
