from flask.views import MethodView
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os


class data_upload(MethodView):
    ALLOWED_EXTENSIONS = {'mf4'}
    UPLOAD_FOLDER = os.path.dirname(__file__)+'/data_upload_file'

    def __init__(self):
            # Create upload folder if it doesn't exist
            if not os.path.exists(self.UPLOAD_FOLDER):
                os.makedirs(self.UPLOAD_FOLDER)

    def get(self):
        
        return
    
    def post(self):
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({"message": "No file uploaded"}), 400

        file = request.files['file']
        #ensure the file actually contains a valid file name
        if not file or file.name=='':
            return jsonify({"message": "No file uploaded"}), 400
        
        if self.file_type_check(file.filename):
            #Secure name for best practice
            filename = secure_filename(file.filename)

            temp_file_name = filename
            file_number = 1
            #prevent files of same name
            while(os.path.isfile(os.path.join(self.UPLOAD_FOLDER, temp_file_name))):     
                temp_file_name = f"({file_number}) {filename}"
                file_number+=1
            filename=temp_file_name
            file.save(os.path.join(self.UPLOAD_FOLDER, filename))
            return jsonify({"message": "Data received successfully"}), 201
        else:
            return jsonify({"message": "Wrong file type submitted. Must be of type mf4"}), 400


    def file_type_check(self, filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS