from flask.views import MethodView
from flask import request

from os import getenv
from utils import create_auth_token, update_expired_token
from datetime import datetime

from http_codes import HttpResponseType

class DataVisualizerAPI(MethodView):
    def __init__(self, db):
        self.db = db   