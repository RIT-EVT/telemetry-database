from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from data_upload_scripts.data_upload import submit_data, get_progress
from utils import exec_get_one


# TODO modify scripts to accept a DBC file
class DateUploadApi(MethodView):

    ALLOWED_EXTENSIONS = {"mf4", "dbc"}
    UPLOAD_FOLDER = os.path.dirname(__file__) + "\\data_upload_file"

    def __init__(self):
        # Create upload folder if it doesn't exist
        if not os.path.exists(self.UPLOAD_FOLDER):
            os.makedirs(self.UPLOAD_FOLDER)

    ## Get the current progress of the
    #  current data upload action
    #  TODO revisit this. Not quite happy with where this call is
    def get(self, contextId):

        return jsonify({"progress": get_progress(contextId)}), 200

    def post(self, contextId):
        # Check if the post request has all needed data needed

        if "mf4File" not in request.files:
            return jsonify({"error": "No mf4 file uploaded"}), 400
        elif "dbcFile" not in request.files:
            return jsonify({"error": "No dbc file uploaded"}), 400
        elif "contextData" not in request.form:
            return jsonify({"error": "No context data passed"}), 400
        elif "contextID" not in request.form:
            return jsonify({"error": "No id passed"}), 400

        config_id = request.form["contextID"]
        mf4File = request.files["mf4File"]
        dbcFile = request.files["dbcFile"]
        context_data = request.form["contextData"]

        # ensure the file actually contains a valid file name
        if not mf4File or mf4File.name == "":
            return jsonify({"error": "No mf4 file uploaded"}), 400
        elif not dbcFile or dbcFile.name == "":
            return jsonify({"error": "No dbc file uploaded"}), 400

        # ensure files are of correct file type before uploading data to NRDB
        if self.file_type_check(mf4File.filename) or self.file_type_check(
            dbcFile.filename
        ):
            # Secure name for best practice
            # Prevent any special characters such
            # as / or . from affecting the path of
            # the file being saved by the server

            mf4FileName = secure_filename(mf4File.filename)
            dbcFileName = secure_filename(dbcFile.filename)

            mf4_file = os.path.join(self.UPLOAD_FOLDER, mf4FileName)
            dbc_file = os.path.join(self.UPLOAD_FOLDER, dbcFileName)

            mf4File.save(mf4_file)
            dbcFile.save(dbc_file)

            # some process is still using these files after function executes
            # !TODO figure out a way to safely remove them from the local server
            #os.remove(mf4_file)
            #os.remove(dbc_file)
            
            # submit the data!
            submit_data(mf4_file, dbc_file, context_data, contextId)

            
            
            return jsonify({"message": "Data received successfully"}), 201
        else:
            return (
                jsonify(
                    {"error": "Wrong file type submitted. Must be of type mf4 and dbc"}
                ),
                400,
            )

    def file_type_check(self, filename):
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )
