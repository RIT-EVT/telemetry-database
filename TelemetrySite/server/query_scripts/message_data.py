from flask.views import MethodView
from utils import authenticate_user, check_expired_tokens
from http_codes import HttpResponseType
from flask import jsonify, request
from json import loads


class MessageFilterData(MethodView):
    def __init__(self, db):
        self.db = db

    def get(self, auth_token):
        if not authenticate_user(auth_token, self.db):
            return HttpResponseType.UNAUTHORIZED.error()
        elif check_expired_tokens(auth_token, self.db):
            return HttpResponseType.UNAUTHORIZED.error()

        return
