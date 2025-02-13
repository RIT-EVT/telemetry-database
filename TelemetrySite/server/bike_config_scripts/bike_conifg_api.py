from flask.views import MethodView
from flask import request, jsonify


class DateUploadApi(MethodView):
    
    def get(self):
        
        return jsonify({"error":"Not implemented"}), 501
    
    def post(self):
        
        return jsonify({"error":"Not implemented"}), 501
    
    
    def delete(self):
        return jsonify({"error":"Not implemented"}), 501
    
    
    