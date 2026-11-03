from flask.views import MethodView
from flask import request, Flask
from werkzeug.utils import secure_filename
import json
import os
import shutil
import uuid
from data_upload_scripts.data_upload import submit_data, get_progress
from utils import validate_user, get_user_id_from_token
from http_codes import HttpResponseType
from log_util import log_warning, log_info


class DataUploadApi(MethodView):

    MF4_EXTENSION = "mf4"
    DBC_EXTENSION = "dbc"
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "data_upload_file")

    def __init__(self, db, app: Flask):
        self.db = db
        self.app = app

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
        user_id = str(get_user_id_from_token(auth_token, self.db))

        if not user_valid:
            error = response.error()
            log_warning(self.app, request, "Unauthorized API acess", user_id, "Invalid auth token", error)
            return error

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
        user_id = str(get_user_id_from_token(auth_token, self.db))

        if not user_valid:
            error = response.error()
            log_warning(self.app, request, "Unauthorized API acess", user_id, "Invalid auth token", error)
            return error

        # Check if the post request has all needed data needed
        if "mf4File" not in request.files:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "mf4File missing in request.files", error)
            return error
        if "dbcFile" not in request.files:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "dbcFile missing in request.files", error)
            return error
        if "contextData" not in request.form:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "contextData missing in request.form", error)
            return error
        if "runOrderNumber" not in request.form:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "runOrderNumber missing in request.form", error)
            return error

        # save all needed data to local variables
        mf4File = request.files["mf4File"]
        dbcFile = request.files["dbcFile"]
        context_data = request.form["contextData"]
        runOrderNumber = request.form["runOrderNumber"]

        # ensure the files actually contain a valid file name
        # (FileStorage.name is the form field, FileStorage.filename is the upload's name)
        if not mf4File.filename: 
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "mf4File missing filename", error)
            return error
        if not dbcFile.filename:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, "dbcFile missing filename", error)
            return error

        # ensure each file is of the correct type before doing any work
        if not self.file_type_check(mf4File.filename, self.MF4_EXTENSION):
            type = self.get_file_type(mf4File.filename)
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, f"mf4File: expected type '{self.MF4_EXTENSION}' got '{type}'", error)
            return error
        if not self.file_type_check(dbcFile.filename, self.DBC_EXTENSION):
            type = self.get_file_type(mf4File.filename)
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, f"dbcFile: expected type '{self.DBC_EXTENSION}' got '{type}'", error)
            return error

        # the context must be a JSON object containing event -> run
        try:
            parsed_context = json.loads(context_data)
            parsed_context["event"]["run"]
        except (ValueError, KeyError, TypeError) as e:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, e)
            return error

        # Secure file names for best practice when saving external
        # gets rid of any "/" or ".." that can change where the file is saved
        mf4FileName = secure_filename(mf4File.filename)
        if not mf4FileName:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, f"mf4File.filename once secured is empty ('{mf4File.filename}' --> '{mf4FileName}')")
            return error

        dbcFileName = secure_filename(dbcFile.filename)
        if not dbcFileName:
            error = HttpResponseType.BAD_REQUEST.error()
            log_warning(self.app, request, "Bad Request", user_id, f"dbcFile.filename once secured is empty ('{dbcFile.filename}' --> '{dbcFileName}')")
            return error

        # each request gets its own folder so concurrent uploads
        # (or identical file names) can't overwrite or delete each other
        request_folder = os.path.join(self.UPLOAD_FOLDER, uuid.uuid4().hex)
        os.makedirs(request_folder)

        result: bool|None = None
        err: Exception|None = None
        try:
            mf4_file = os.path.join(request_folder, mf4FileName)
            dbc_file = os.path.join(request_folder, dbcFileName)

            mf4File.save(mf4_file)
            dbcFile.save(dbc_file)

            # submit the data!
            submit_data(mf4_file, dbc_file, context_data, runOrderNumber, self.db)
            result = True
        except Exception as e:
            result = False
            err = e
        finally:
            # remove the files from the server end, even if processing failed
            shutil.rmtree(request_folder, ignore_errors=True)

        if result == True:
            msg = HttpResponseType.CREATED.value
            log_info(self.app, request, "Data received successfully", user_id, msg)
            return {"message": "Data received successfully"}, msg
        else:
            msg = HttpResponseType.INTERNAL_SERVER_ERROR.value
            log_warning(self.app, request, "Failed to upload data", user_id, err, msg)
            return {"message": "Data failed to upload"}, msg

    def get_file_type(self, filename):
        if "." in filename:
            return filename.rsplit(".", 1)[1].lower()
        else:
            return None

    def file_type_check(self, filename, extension):
        """
        Verify the file has the expected type

        Args:
            filename (string): File name to check
            extension (string): Required extension (without the dot)

        Returns:
            boolean: If the file type is valid
        """
        return self.get_file_type(filename) == extension
