
from flask.views import MethodView
from flask import request, jsonify

import utils



class event_api(MethodView):
    
    def get(self):
        jsonData = request.get_json()

        if not jsonData:
            return jsonify({"error": "No data"}), 400
        elif not "contextId" in jsonData:
            return jsonify({"error": "No context id"}), 400

        contextId =  jsonData["contextId"]
        sqlCommand =""
        return jsonify({"Data":""})
