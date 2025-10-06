from enum import Enum

class HttpResponseType(Enum):
    
    OK = 200
    CREATED = 201
    ACCEPTED = 202
    NO_CONTENT = 204

    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    
    INTERNAL_SERVER_ERROR = 500
    NOT_IMPLEMENTED = 501

    def error(self):
        """Return a human-readable description for the HTTP error

        Returns:
            string: Description of HTTP error.
        """
        descriptions = {
            400: {"Bad Request": "The server could not understand the request."},
            401: {"Unauthorized": "Authentication is required."},
            403: {"Forbidden": "The server understood the request but refuses to authorize it."},
            404: {"Not Found": "The requested resource could not be found."},
            
            500: {"Internal Server Error": "A generic server error occurred."},
            501: {"Not Implemented": "The server does not recognize the request method."},
        }
        return descriptions.get(self.value, "Unknown Status Code"), self.value
