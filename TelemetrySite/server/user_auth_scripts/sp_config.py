from os import path

folder_path = path.dirname(__file__)

# ---- Static Configuration ----

BASE_URL = "http://129.21.157.126:5000/"
SP_ENTITY_ID = "http://129.21.157.126:5000/saml2/testing"

SP_KEY_PATH = f"{folder_path}/login_data/service.key"
SP_CERT_PATH = f"{folder_path}/login_data/service.crt"

IDP_SSO_URL = "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/Redirect/SSO"
IDP_METADATA_PATH = f"{folder_path}/login_data/idp.xml"

CONFIG = {
    "entityid": SP_ENTITY_ID,
    "name": "Python SP Example",
    "service": {
        "sp": {
            "allow_unsolicited": True,
            "authn_requests_signed": False,
            "endpoints": {
                "assertion_consumer_service": [f"{BASE_URL}saml2/acs"],
                "single_sign_on_service": [IDP_SSO_URL],
            },
        },
    },
    "metadata": {
        "local": [IDP_METADATA_PATH],
    },
    "allow_unknown_attributes": True,
    "metadata_key_usage": "both",
    "key_file": SP_KEY_PATH,
    "cert_file": SP_CERT_PATH,
    "encryption_keypairs": [
        {
            "key_file": SP_KEY_PATH,
            "cert_file": SP_CERT_PATH,
        },
    ],
    "xmlsec_binary": "C:\\Users\\ejhin\\Downloads\\xmlsec1-1.2.20-win32-x86_64\\bin\\xmlsec1.exe",
    "delete_tmpfiles": True,
}
