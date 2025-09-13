from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from data_upload_scripts.data_upload import submit_data, get_progress
from utils import authenticate_user, check_expired_tokens

class DataUploadApi(MethodView):

    ALLOWED_EXTENSIONS = {"mf4", "dbc"}
    UPLOAD_FOLDER = os.path.dirname(__file__) + "\\data_upload_file"

    def __init__(self):
        # Create upload folder if it doesn't exist
        if not os.path.exists(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)

 
    def get(self, auth_token):
        """
            Get the current progress of a data upload

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: Progress value
        """
        if not authenticate_user(auth_token):
            return jsonify({"authError":"unauthenticated user"}), 400
        elif check_expired_tokens(auth_token):
            return jsonify({"authError":"expired user token"}), 400
        
        return jsonify(get_progress()), 200

    def post(self, auth_token):
        """
            Decode incoming MF4 and DBC file and add the results to the DB

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: success message
        """
        
        if not authenticate_user(auth_token):
            return jsonify({"authError":"unauthenticated user"}), 400
        elif check_expired_tokens(auth_token):
            return jsonify({"authError":"expired user token"}), 400
        
        # Check if the post request has all needed data needed
        if "mf4File" not in request.files:
            return jsonify({"error": "No mf4 file uploaded"}), 400
        elif "dbcFile" not in request.files:
            return jsonify({"error": "No dbc file uploaded"}), 400
        elif "contextData" not in request.form:
            return jsonify({"error": "No context data passed"}), 400
       # save all needed data to local variables
        mf4File = request.files["mf4File"]
        dbcFile = request.files["dbcFile"]
        context_data = request.form["contextData"]
        runOrderNumber = request.form["runOrderNumber"]
        
        # ensure the file actually contains a valid file name and files
        if not mf4File or mf4File.name == "":
            return jsonify({"error": "No mf4 file uploaded"}), 400
        elif not dbcFile or dbcFile.name == "":
            return jsonify({"error": "No dbc file uploaded"}), 400

        # ensure files are of correct file type before uploading data to NRDB
        if self.file_type_check(mf4File.filename) and self.file_type_check(
            dbcFile.filename
        ):
            # Secure file names for best practice when saving external
            # gets rid of any "/" or "." that can change where the file is saved

            mf4FileName = secure_filename(mf4File.filename)
            dbcFileName = secure_filename(dbcFile.filename)

            mf4_file = os.path.join(self.UPLOAD_FOLDER, mf4FileName)
            dbc_file = os.path.join(self.UPLOAD_FOLDER, dbcFileName)

            mf4File.save(mf4_file)
            dbcFile.save(dbc_file)
            
            # submit the data!
            submit_data(mf4_file, dbc_file, context_data, runOrderNumber)

            # remove the file from the sever end
            os.remove(mf4_file)
            os.remove(dbc_file)
            
            return jsonify({"message": "Data received successfully"}), 201
        else:
            return (
                jsonify(
                    {"error": "Wrong file type submitted. Must be of type mf4 and dbc"}
                ),
                400,
            )

    def file_type_check(self, filename):
        """
        Verify the the files are valid types

        Args:
            filename (string): File name to check

        Returns:
            boolean: If the file type is valid
        """
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )
