from flask import request, jsonify
from flask.views import MethodView


class ServerTest(MethodView):
    ## Test function to determine if server is online
    #
    #Returns a value if server is online
    def get(self):

        return jsonify({"Result":"Server Online"}), 200