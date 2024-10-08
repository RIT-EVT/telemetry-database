from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
import dotenv

app = Flask(__name__) #create Flask instance
CORS(app) #Enable CORS on Flask server to work with Nodejs pages
api = Api(app) #api router


if __name__ == '__main__':
    print("Starting flask")
    app.run(debug=True), #starts Flask