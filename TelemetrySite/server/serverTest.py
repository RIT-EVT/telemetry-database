from flask import request, jsonify
from flask.views import MethodView


class ServerTest(MethodView):

    def get(self):

        return jsonify({"Result":"Server Online"}), 200