from flask import Flask, jsonify, request
from flask_restful import reqparse
import utils


app = Flask(__name__)

# Get specific BmsConfig record
@app.route('/bmsconfig/<int:id>', methods=['GET'])
def get_bmsconfig(self):
    try:
        buttonID = request.args.get('buttonID', default= -1)

        if(int(buttonID) >= 1):
            print("DING")
            
        sql = "SELECT * FROM BmsConfig WHERE id = %s"
        bmsconfig = utils.exec_get_one(sql, (id,))
        if bmsconfig is None:
            return jsonify({'message': 'BmsConfig not found'}), 404

        result = {
            'id': bmsconfig[0],
            'configName': bmsconfig[1],
            'hardwareRevision': bmsconfig[2],
            'softwareCommitHash': bmsconfig[3],
            'totalVoltageUnits': bmsconfig[4],
            'batteryVoltageUnits': bmsconfig[5],
            'currentUnits': bmsconfig[6],
            'packTempUnits': bmsconfig[7],
            'bqTempUnits': bmsconfig[8],
            'cellVoltageUnits': bmsconfig[9]
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve BmsConfig: {str(e)}'}), 500
    


# idk how to make this one yet
@app.route('/items', methods=['DELETE'])
def hide_table_BmsConfig(item): # mark as not active, do not delete
    try:
        print("deez")
        return 0
    except Exception as e:
        return jsonify({'error': f'Failed to deactivate: not implemented yet'}), 405 # modify error to not implemented 405
    # deez

# Insert a new BmsConfig record
# edit to 
@app.route('/bmsconfig', methods=['POST'])
def insert_bmsconfig(self):
    try:
        # Get request
        parser = reqparse.RequestParser()
        #data = request.get_json() # change to recieve data as an http request  ///////////////////////////////////////////////////// ps: reqparse

        # Validate req fields
        required_fields = ['configName', 'hardwareRevision', 'softwareCommitHash', 'totalVoltageUnits', 
                           'batteryVoltageUnits', 'currentUnits', 'packTempUnits', 'bqTempUnits', 'cellVoltageUnits']
        
        parser.add_argument("id")
        parser.add_argument("configName")
        parser.add_argument("hardwareRevision")
        parser.add_argument("softwareCommitHash")
        parser.add_argument("totalVoltageUnits")
        parser.add_argument("batteryVoltageUnits")
        parser.add_argument("currentUnits")
        parser.add_argument("bqTempUnits")
        parser.add_argument("cellVoltageUnits")

        args = parser.parse_args()
        
        # for now its is an automatic insert but implement functoin calls depending on arg values

        # insert query
        sql = """
            INSERT INTO BmsConfig (configName, hardwareRevision, softwareCommitHash, totalVoltageUnits, 
                                   batteryVoltageUnits, currentUnits, packTempUnits, bqTempUnits, cellVoltageUnits)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        # Prepare the vals to inserted
        values = (
            args["id"],
            args['configName'], 
            args['hardwareRevision'], 
            args['softwareCommitHash'], 
            args['totalVoltageUnits'], 
            args['batteryVoltageUnits'], 
            args['currentUnits'], 
            args['packTempUnits'], 
            args['bqTempUnits'], 
            args['cellVoltageUnits']
        )
        
        # Execute query
        inserted_id = utils.exec_commit_with_id(sql, values)
        
        return jsonify({'message': 'BmsConfig created successfully', 'id': inserted_id[0][0]}), 201

    except Exception as e:
        return jsonify({'error': f'Failed to insert: {str(e)}'}), 500
