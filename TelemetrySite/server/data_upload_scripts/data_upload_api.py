from flask.views import MethodView
from flask import request
from werkzeug.utils import secure_filename
import json
import os
import shutil
import uuid
from data_upload_scripts.data_upload import submit_data, get_progress
from utils import validate_user
from http_codes import HttpResponseType


class DataUploadApi(MethodView):

    MF4_EXTENSION = "mf4"
    DBC_EXTENSION = "dbc"
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "data_upload_file")

    def __init__(self, db):
        self.db = db
        # Create upload folder if it doesn't exist
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

    def get(self, auth_token):
        """
            Get the current progress of a data upload

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: Progress value
        """

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        return get_progress(), HttpResponseType.OK.value

    def post(self, auth_token):
        """
            Decode incoming MF4 and DBC file and add the results to the DB

        Args:
            auth_token (string): The user's unique authentication string

        Returns:
            tuple: success message
        """

        user_valid, response = validate_user(auth_token, self.db)

        if not user_valid:
            return response.error()

        # Check if the post request has all needed data needed
        if "mf4File" not in request.files or "dbcFile" not in request.files:
            return HttpResponseType.BAD_REQUEST.error()
        if "contextData" not in request.form or "runOrderNumber" not in request.form:
            return HttpResponseType.BAD_REQUEST.error()

        # save all needed data to local variables
        mf4File = request.files["mf4File"]
        dbcFile = request.files["dbcFile"]
        context_data = request.form["contextData"]
        runOrderNumber = request.form["runOrderNumber"]

        # ensure the files actually contain a valid file name
        # (FileStorage.name is the form field, FileStorage.filename is the upload's name)
        if not mf4File.filename or not dbcFile.filename:
            return HttpResponseType.BAD_REQUEST.error()

        # ensure each file is of the correct type before doing any work
        if not self.file_type_check(
            mf4File.filename, self.MF4_EXTENSION
        ) or not self.file_type_check(dbcFile.filename, self.DBC_EXTENSION):
            return HttpResponseType.BAD_REQUEST.error()

        # the context must be a JSON object containing event -> run
        try:
            parsed_context = json.loads(context_data)
            parsed_context["event"]["run"]
        except (ValueError, KeyError, TypeError):
            return HttpResponseType.BAD_REQUEST.error()

        # Secure file names for best practice when saving external
        # gets rid of any "/" or ".." that can change where the file is saved
        mf4FileName = secure_filename(mf4File.filename)
        dbcFileName = secure_filename(dbcFile.filename)
        if not mf4FileName or not dbcFileName:
            return HttpResponseType.BAD_REQUEST.error()

        # each request gets its own folder so concurrent uploads
        # (or identical file names) can't overwrite or delete each other
        request_folder = os.path.join(self.UPLOAD_FOLDER, uuid.uuid4().hex)
        os.makedirs(request_folder)

        try:
            mf4_file = os.path.join(request_folder, mf4FileName)
            dbc_file = os.path.join(request_folder, dbcFileName)

            mf4File.save(mf4_file)
            dbcFile.save(dbc_file)

            # submit the data!
            submit_data(mf4_file, dbc_file, context_data, runOrderNumber, self.db)
        finally:
            # remove the files from the server end, even if processing failed
            shutil.rmtree(request_folder, ignore_errors=True)

        return {"message": "Data received successfully"}, HttpResponseType.CREATED.value

    def file_type_check(self, filename, extension):
        """
        Verify the file has the expected type

        Args:
            filename (string): File name to check
            extension (string): Required extension (without the dot)

        Returns:
            boolean: If the file type is valid
        """
        return "." in filename and filename.rsplit(".", 1)[1].lower() == extension
