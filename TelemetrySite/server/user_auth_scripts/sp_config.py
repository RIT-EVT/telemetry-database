from os import path
    
folder_path=path.dirname(__file__)
        
# SP Section
# base url of your site
#TODO replace with url
BASE_URL = "http://127.0.0.1:5000/"
# your generated entity id
#TODO figure out what to populate this with
SP_ENTITY_ID = f"{BASE_URL}login/"
# path to a base64 encoded private key (PEM) for the SP
SP_KEY_PATH = f"{folder_path}/login_data/saml.pem"
# path to a base64 encoded certificate (PEM) for the SP
SP_CERT_PATH = f"{folder_path}/login_data/saml.crt"
# End SP Section

# IdP Section
# single-sign-on url for your IdP
IDP_SSO_URL = "https://shibboleth.main.ad.rit.edu/idp/profile/SAML2/Redirect/SSO"
# Path to the metadata downloaded from your IdP.
# You can download RIT's metadata at https://shibboleth.main.ad.rit.edu/idp/shibboleth
IDP_METADATA_PATH = f"{folder_path}/login_data/idp.xml"
# End IdP Section
        
CONFIG = {    
    "entityid": SP_ENTITY_ID,
    # Name of your service in metadata
    "name": "Python SP Example",
    "service": {
        "sp": {
            # Allow a user to initiate login from the IdP
            "allow_unsolicited": True,
            "authn_requests_signed": False,
            "endpoints": {
                # Callback service that parses SAML attributes
                "assertion_consumer_service": [f"{BASE_URL}saml2/acs"],
                # Service the app requests when logging in
                "single_sign_on_service": [IDP_SSO_URL]
            },            
        },        
    },
    "metadata": {
        "local": [
            IDP_METADATA_PATH
        ]
    },
    "allow_unknown_attributes": True,
    "metadata_key_usage" : "both",
    # Keypair used to sign xml payloads
    "key_file": SP_KEY_PATH,
    "cert_file": SP_CERT_PATH,
    # Keypair used to encrypt xml payloads
    "encryption_keypairs": [
        {
            "key_file": SP_KEY_PATH,
            "cert_file": SP_CERT_PATH,
        },
    ],
    # Path the xmlsec binary, this will likely change depending on your
    # base image
    "xmlsec_binary": "C:\\Users\\ejhin\\Downloads\\xmlsec1-1.2.20-win32-x86_64\\bin\\xmlsec1.exe",    
    "delete_tmpfiles": True,       
}