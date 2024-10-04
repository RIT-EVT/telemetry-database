from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask.views import MethodView

import dotenv


from context import Context
import utils

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router

CORS(app)
    

user_view = Context.as_view('user_api')
app.add_url_rule('/Context', view_func=user_view, methods=['GET', 'PUT', 'DELETE', 'POST'])

if __name__ == '__main__':
    dotenv.load_dotenv()
    print("Starting flask")
    app.run(debug=True)  # Starts Flask
    


    
