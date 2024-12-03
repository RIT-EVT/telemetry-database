from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from data_upload_scripts.data_upload import file_convert, get_progress
from data_upload_scripts.data_organization import organize_can_from_db
from utils import exec_get_one, exec_get_all


class DateUploadApi(MethodView):

    ALLOWED_EXTENSIONS = {"mf4"}
    UPLOAD_FOLDER = os.path.dirname(__file__) + "/data_upload_file"

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
        # Check if the post request has the file part

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        elif "contextID" not in request.form:
            return jsonify({"error": "No id passed"}), 400

        config_id = request.form["contextID"]
        file = request.files["file"]

        # check for a duplicate context id value
        sql_check_unique = "SELECT 1 FROM canMessage WHERE contextId = %s"
        sql_check_result = exec_get_one(
            sql_check_unique,
            [config_id],
        )

        if not sql_check_result is None:
            return jsonify({"error": "Attempt to upload duplicate context id"}), 400

        # check for key in context db
        sql_check_exists = "SELECT 1 FROM context WHERE id = %s"
        sql_check_result = exec_get_one(
            sql_check_exists,
            [config_id],
        )
        # return an error if id doesn't exists
        if sql_check_result is None:
            return (
                jsonify({"error": "Passed context id does not exits in database"}),
                400,
            )

        # ensure the file actually contains a valid file name
        if not file or file.name == "":
            return jsonify({"error": "No file uploaded"}), 400

        if self.file_type_check(file.filename):
            # Secure name for best practice
            # Prevent any special characters such
            # as / or . from affecting the path of
            # the file being saved by the server

            filename = secure_filename(file.filename)

            temp_file_name = filename
            file_number = 1
            # prevent files of same name
            while os.path.isfile(os.path.join(self.UPLOAD_FOLDER, temp_file_name)):
                temp_file_name = f"({file_number})_{filename}"
                file_number += 1
            # save file path and file
            filename = temp_file_name
            file_path = os.path.join(self.UPLOAD_FOLDER, filename)
            file.save(file_path)
            file_convert(file_path, config_id)
            # remove mf4 file from local storage
            os.remove(file_path)
            organize_can_from_db(contextId)

            return jsonify({"message": "Data received successfully"}), 201
        else:
            return (
                jsonify({"error": "Wrong file type submitted. Must be of type mf4"}),
                400,
            )

    def file_type_check(self, filename):
        return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in self.ALLOWED_EXTENSIONS
        )
