from flask import Flask
from flask_restful import Resource, Api, reqparse, request
from flask_cors import CORS
import pymongo
import os
import urllib.parse

app = Flask(__name__) #create Flask instance
CORS(app) #Enable CORS on Flask server to work with Nodejs pages
api = Api(app) #api router


def create_db_connection(self):
        connection_string = "mongodb://" + urllib.parse.quote_plus(str(os.getenv("DB_USER"))) + ":" + urllib.parse.quote_plus(str(os.getenv("DB_PASSWORD")))  + "@" + str(os.getenv("DB_HOST")) + ":" + str(os.getenv("DB_PORT"))
        mongo_client = pymongo.MongoClient(connection_string)
        
        db_access = mongo_client["client"]
        return db_access

"""
This is a sample endpoint. When we run a get request to localhost:5000/hello-world, we will get a response of "Hello, World!"
Note that the endpoint (the string in the app.route function) is named hello-world and so is the method. 
This is not a requirement, but it is a good practice to name the method the same as the endpoint.
The methods are the functions that are called when a request is made to the endpoint.
These can be GET, POST, PUT, and DELETE depending on what you want to do with the endpoint. 
(Technically you can name them anything, but it is a good practice to name them the same as the request type.)
"""
@app.route("/sample_endpoint", methods=["GET", "POST", "PUT", "DELETE"]) 
def sample_endpoint():
    if request.method == "GET":
        try:
            # This is a GET request
            # For example, you can return a JSON response
            # You can also query the database or do any other operations here
            # Note that this sample represents the general standard we have for API calls. 
            db_connection = create_db_connection()["sample_client"]
            # Get requests DO NOT HAVE BODIES.
            # This means that we cannot use request.json to access the data sent in the request.
            # Instead, we have to use request.args to access the data sent in the url request.
            data_piece_one = request.args.get('data_piece_one')
            # This is how we access the data sent in the request.
            # In this case we are going to get all instances where the data_piece_one is equal to the data_piece_one sent in the request.
            output = db_connection.find({"data_piece_one":data_piece_one})
            # We return a dictionary with a message and data as common dictionary keys in a tuple with the status code.

            return {"message": "Data retrieved succesfully ", "data": output}, 200
        except Exception as e:
            # If there is an error, return an error message
            return {"message": "Error retrieving data", "error": str(e)}, 500
    elif request.method == "POST":
        try:
            # This is a POST request
            # You can access the data sent in the request using request.json or request.form
            # This database connection creates a connection to a collection in the database named sample_client.
            db_connection = create_db_connection()["sample_client"]
            # Request.json is used to access the data sent in the request body
            data = request.json
            # This is how we access the data sent in the request.
            # In general it is good to keep the names consistent. 
            data_piece_one = data.get("data_piece_one")
            data_piece_two = data.get("data_piece_two")
            # You can perform any operations with the data here, such as saving it to a database
            # In this case we are going to update the db where the data_piece_one is equal to the data_piece_one sent in the request.
            # We are going to set the data_piece_two to the data_piece_two sent in the request.
            db_connection.update_many({"data_piece_one":data_piece_one}, {"$set":{"data_piece_two":data_piece_two}})
            # Return a success message
            return {"message": "Data saved successfully", "data": None}, 200
        except Exception as e:
            # If there is an error, return an error message
            return {"message": "Error saving data", "error": str(e)}, 500
    elif request.method == "PUT":
        try:
            # This is a PUT request
            # You can access the data sent in the request using request.json or request.form
            # This database connection creates a connection to a collection in the database named sample_client.
            db_connection = create_db_connection()["sample_client"]
            # Request.json is used to access the data sent in the request body
            data = request.json
            # This is how we access the data sent in the request.
            # In general it is good to keep the names consistent. 
            data_piece_one = data.get("data_piece_one")
            data_piece_two = data.get("data_piece_two")
            # You can perform any operations with the data here, such as saving it to a database
            # Here we will be inserting new data into the database.
            db_connection.insert({"data_piece_one":data_piece_one, "data_piece_two":data_piece_two})
            # Return a success message
            return {"message": "Data inserted successfully", "data": None}, 200
        except Exception as e:
            # If there is an error, return an error message
            return {"message": "Error inserting data", "error": str(e)}, 500
    elif request.method == "DELETE":
        try:
            # This is a PUT request
            # You can access the data sent in the request using request.json or request.form
            # This database connection creates a connection to a collection in the database named sample_client.
            db_connection = create_db_connection()["sample_client"]
            # Request.json is used to access the data sent in the request body
            data = request.json
            # This is how we access the data sent in the request.
            # In general it is good to keep the names consistent. 
            data_piece_one = data.get("data_piece_one")
            # You can perform any operations with the data here, such as saving it to a database
            # Here we will be deleting all instances where the data_piece_one is equal to the data_piece_one sent in the request.
            db_connection.delete({"data_piece_one": data_piece_one})
            # Return a success message
            return {"message": "Data deleted successfully", "data": None}, 200
        except Exception as e:
            # If there is an error, return an error message
            return {"message": "Error deleting data", "error": str(e)}, 500
        

if __name__ == '__main__': 
    print("Starting flask")
    app.run(debug=True), #starts Flask