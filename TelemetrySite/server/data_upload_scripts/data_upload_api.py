from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from data_upload_scripts.data_upload import submit_data, get_progress

class DateUploadApi(MethodView):

    ALLOWED_EXTENSIONS = {"mf4", "dbc"}
    UPLOAD_FOLDER = os.path.dirname(__file__) + "\\data_upload_file"

    def __init__(self):
        # Create upload folder if it doesn't exist
        if not os.path.exists(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)

    ## Get the current progress of the
    #  current data upload action
    def get(self):
        return jsonify(get_progress()), 200

    ## Take in a mf4, dbc, and json object for the run and submit to nrdb
    def post(self):
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
            submit_data(mf4_file, dbc_file, context_data)

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

    ## Ensure the uploaded file types match the expected files
    #
    # @param self instance of the object
    # @param filename name of the file to check
    # @return boolean of if the name matches
    def file_type_check(self, filename):
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )
