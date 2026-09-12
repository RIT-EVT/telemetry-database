from enum import Enum


class HttpResponseType(Enum):

    OK = "200"  # Operation was successful
    CREATED = "201"  # Desired resource created in DB
    ACCEPTED = "202"  # Request received and approved
    NO_CONTENT = "204"  # Operation completed but nothing returned

    BAD_REQUEST = "400"  # Request body wasn't right
    UNAUTHORIZED = "401"  # Auth token was invalid
    FORBIDDEN = "403"  # Resource unavailable
    NOT_FOUND = "404"  # Endpoint not found
    TEA_POT = "418"  # I am a tea pot

    INTERNAL_SERVER_ERROR = "500"  # Server messed up
    NOT_IMPLEMENTED = "501"  # This endpoint exists, but the code isn't ready

    def error(self):
        return DESCRIPTIONS.get(self.value, "Unknown Status Code"), self.value

    def strip(self):
        return self.value


DESCRIPTIONS = {
    "400": {"Bad Request": "The server could not understand the request."},
    "401": {"Unauthorized": "Authentication is required."},
    "403": {
        "Forbidden": "The server understood the request but refuses to authorize it."
    },
    "404": {"Not Found": "The requested resource could not be found."},
    "500": {"Internal Server Error": "A generic server error occurred."},
    "501": {"Not Implemented": "The server does not recognize the request method."},
}
