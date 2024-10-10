from flask import Flask, jsonify
from flask_restful import Api
from flask_cors import CORS
<<<<<<< HEAD
import dotenv 
import json
from Context.context import Context
 
=======
import dotenv
>>>>>>> origin

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router

CORS(app)
    
#create views for url rules
user_view = Context.as_view('context_api')
app.add_url_rule('/Context', view_func=user_view, methods=['GET', 'PUT', 'DELETE', 'POST'])

## Get all the url paths
#
# @return JSON file of path values
@app.route('/')
def MainContext():
     # Open the JSON file and load its contents
    try:
        with open('ServerPaths.json', 'r') as json_file:
            data = json.load(json_file)
        return jsonify(data), 200
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding JSON"}), 500

if __name__ == '__main__':
    dotenv.load_dotenv('./credentials.env')
    print("Starting flask")
    app.run(debug=True)  # Starts Flask

    


    
