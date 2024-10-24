from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from data_upload_scripts.data_upload import file_convert
from utils import exec_get_one, exec_get_all


class data_upload_api(MethodView):
    ALLOWED_EXTENSIONS = {'mf4'}
    UPLOAD_FOLDER = os.path.dirname(__file__)+'/data_upload_file'

    def __init__(self):
            # Create upload folder if it doesn't exist
            if not os.path.exists(self.UPLOAD_FOLDER):
                os.makedirs(self.UPLOAD_FOLDER)

    def get(self):
        
        return jsonify(["Reading data"]), 200
    
    def post(self):
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        elif 'contextID' not in request.form:
            return jsonify({"error":"No id passed"}), 400
            
        config_id = request.form["contextID"]
        file = request.files['file']

        #check for a duplicate context id value
        sql_check_unique = "SELECT 1 FROM canmessage WHERE contextId = %s"
        sql_check_result = exec_get_one(sql_check_unique, [config_id, ])
        print(sql_check_result)
        if not sql_check_result is None:
            return jsonify({"error": "Attempt to upload duplicate context id"}), 400
        
        #check for key in context db
        sql_check_exists = "SELECT 1 FROM context WHERE id = %s"
        sql_check_result = exec_get_one(sql_check_exists, [config_id, ])
       
        if sql_check_result is None:
            return jsonify({"error": "Passed context id does not exits in database"}), 400
        
        #ensure the file actually contains a valid file name
        if not file or file.name=='':
            return jsonify({"error": "No file uploaded"}), 400
        
        if self.file_type_check(file.filename):
            #Secure name for best practice
            filename = secure_filename(file.filename)

            temp_file_name = filename
            file_number = 1
            #prevent files of same name
            while(os.path.isfile(os.path.join(self.UPLOAD_FOLDER, temp_file_name))):     
                temp_file_name = f"({file_number})_{filename}"
                file_number+=1
            #save file path and file
            filename=temp_file_name
            file_path = os.path.join(self.UPLOAD_FOLDER, filename)
            file.save(os.path.join(self.UPLOAD_FOLDER, filename))
            file_convert(file_path, config_id)
          
            return jsonify({"message": "Data received successfully"}), 201
        else:
            return jsonify({"error": "Wrong file type submitted. Must be of type mf4"}), 400


    def file_type_check(self, filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS