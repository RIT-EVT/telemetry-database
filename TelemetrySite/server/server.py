from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask.views import MethodView

import dotenv


from context import Context


# Now you can import the module
import utils
# TODO turn into a rest API
# TODO Change add to a put

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router

CORS(app)
    

user_view = Context.as_view('user_api')
app.add_url_rule('/Context', view_func=user_view, methods=['GET', 'PUT'])

## Fetch the names of saved configs for a config type
#
# @param ConfigName Config table to search through
# @return configData Data of all configs saved
@app.route('/Context/Configs/<ConfigName>')
def GetSingleConfigName(ConfigName):
   
    configData={}
    sqlCommand = f"SELECT name FROM {ConfigName} WHERE name IS NOT NULL"
    configData[ConfigName] = utils.exec_get_all(sqlCommand, [0,])
  
    return jsonify(configData)

if __name__ == '__main__':
    dotenv.load_dotenv()
    print("Starting flask")
    app.run(debug=True)  # Starts Flask


    
