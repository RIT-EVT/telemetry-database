from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
import dotenv
from sqlalchemy.orm import relationship

# Now you can import the module
import utils


app = Flask(__name__)  # Create Flask instance
api = Api(app)  # API router

CORS(app)

#function to pull data from the data base
@app.route('/Context')
def GetContext():
    id = request.get_data()
    if not id:
        return jsonify({"error":"No valid id provided"})
    
##Call to this to post context to the DB
#
#@param data JSON object of context to post. Must be a dictionary
#@return success message or an error
@app.route('/Context', methods = ['POST'])
def SubmitContext():
    # Get JSON data from the request
    data = request.get_json()

    # Check if data was received
    if not data:
        return jsonify({"error": "No data provided"}), 400
    #convert dictionary received to a tuple
    contextValue =  DictToTuple(data["Context"])
    
    #establish sql commands for all non event, bike, and context configs
    sqlCommands = [
        "INSERT into BmsConfig (id, hardwareRevision, softwareCommitHash, totalVoltageUnits, batteryVoltageUnits, currentUnits, packTempUnits, bqTempUnits, cellVoltageUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        "INSERT into ImuConfig (id, hardwareRevision, softwareCommitHash, eulerUnits, gyroUnits, linearAccelerationUnits, accelerometerUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s) RETURNING id",
        "INSERT into TmuConfig (id, hardwareRevision, softwareCommitHash, thermUnits) VALUES (DEFAULT, %s, %s, %s) RETURNING id",
        "INSERT into TmsConfig (id, hardwareRevision, softwareCommitHash, tempUnits, pumpSpeedUnits, fanSpeedUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s) RETURNING id",
        "INSERT into PvcConfig (id, hardwareRevision, softwareCommitHash) VALUES (DEFAULT, %s, %s) RETURNING id",
        "INSERT into McConfig (id, model, firmwareVersion) VALUES (DEFAULT, %s, %s) RETURNING id"
    ]

    sqlEvent = "INSERT into Event (id, eventDate, eventType, location) VALUES (DEFAULT, %s, %s, %s) RETURNING id"
    sqlBikeConfig = "INSERT into BikeConfig (id, platformName, tirePressure, coolantVolume, bmsConfigId, imuConfigId, tmuConfigId, tmsConfigId, pvcConfigId, mcConfigId) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"

    sqlContext = "INSERT into Context (id, airTemp, humidity, windSpeed, windAngle, riderName, riderWeight, driverFeedback, distanceCovered, startTime, eventId, bikeConfigId) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"

    eventAndBikeId=[]
    idBikeConfig=[]


    for i in range(len(sqlCommands)):
        #save the id for each config for reference in the Bike Config

        idBikeConfig.append(utils.exec_commit_with_id(sqlCommands[i], DictToTuple(contextValue[i+3]))[0][0])
   
    #save the event and bike ids for to reference in the context db
    eventAndBikeId.append(utils.exec_commit_with_id(sqlEvent, DictToTuple(contextValue[1]))[0][0])
    eventAndBikeId.append(utils.exec_commit_with_id(sqlBikeConfig, DictToTuple(contextValue[2])+tuple(idBikeConfig))[0][0])

    utils.exec_commit_with_id(sqlContext, DictToTuple(contextValue[0])+tuple(eventAndBikeId))

    # Respond back to the client
    return jsonify({"message": "Data received successfully", "received": data}), 200

## Convert a dictionary to a python tuple
## And remove the first value
#
#@param dictObject object to convert to tuple
#@return tuple of dictionary values without the first value
def DictToTuple(dictObject):
    return tuple(dictObject.values())



## Get all the past config data saved and return 
## any of them with a name
#
# @param configName Name to fetch saved configs 
@app.route('/Context/Configs/<configName>')
def GetConfigData():
    return jsonify(0)
    

if __name__ == '__main__':
    dotenv.load_dotenv()
    print("Starting flask")
    app.run(debug=True)  # Starts Flask

GetIDNumbers()
    