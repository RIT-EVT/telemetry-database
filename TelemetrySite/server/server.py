from flask import Flask
from flask_restful import Api
from flask_cors import CORS
import dotenv 

from context import Context
from serverTest import ServerTest

app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router

CORS(app)
    
#create views for url rules
user_view = Context.as_view('context_api')
app.add_url_rule('/Context', view_func=user_view, methods=['GET', 'PUT', 'DELETE', 'POST'])
server_test_view= ServerTest.as_view('server_test_api')
app.add_url_rule('/Test', view_func=server_test_view, methods=['GET'])


if __name__ == '__main__':
    dotenv.load_dotenv()
    print("Starting flask")
    app.run(debug=True)  # Starts Flask
    


    
