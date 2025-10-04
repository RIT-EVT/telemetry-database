import os
from saml2 import BINDING_HTTP_POST, BINDING_HTTP_REDIRECT

# Base paths
file_path = os.path.dirname(__file__)
LOGIN_DATA_PATH = os.path.join(file_path, "login_data")

# Replace with your actual base URL
# TODO add url here
BASE_URL = "URL"

# Paths for metadata and certs
SP_ENTITY_ID = f"{BASE_URL}/saml2/metadata"
SP_METADATA_PATH = os.path.join(LOGIN_DATA_PATH, "sp_metadata.xml")
SP_KEY_PATH = os.path.join(LOGIN_DATA_PATH, "sp.key")
SP_CERT_PATH = os.path.join(LOGIN_DATA_PATH, "sp.crt")
IDP_METADATA_PATH = os.path.join(LOGIN_DATA_PATH, "idp_metadata.xml")
# TODO add exe path
XMLSEC_BINARY = "PATH_TO_XMLSEC"

# SAML configuration
SAML_CONFIG = {
    "entityid": SP_ENTITY_ID,
    "service": {
        "sp": {
            "name": "Flask SAML SP",
            "endpoints": {
                "assertion_consumer_service": [
                    (f"{BASE_URL}/api/saml2/acs", BINDING_HTTP_POST),
                ],
            },
            "allow_unsolicited": True,
            "authn_requests_signed": False,
        },
    },
    "metadata": {
        "local": [IDP_METADATA_PATH],
    },
    "idp": {
        "https://shibboleth.main.ad.rit.edu/idp/shibboleth": {
            "single_sign_on_service": {
                BINDING_HTTP_REDIRECT: "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/Redirect/SSO",
                BINDING_HTTP_POST: "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/POST/SSO",
            },
            "single_logout_service": {
                BINDING_HTTP_REDIRECT: "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/Redirect/SLO",
                BINDING_HTTP_POST: "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/POST/SLO",
            },
        },
    },
    "key_file": SP_KEY_PATH,
    "cert_file": SP_CERT_PATH,
    "xmlsec_binary": XMLSEC_BINARY,
    "allow_unknown_attributes": True,
}
