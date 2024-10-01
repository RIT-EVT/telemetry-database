from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from flask.views import MethodView
import utils


class Context(MethodView):
    configNames = ("BmsConfig", "ImuConfig", "TmuConfig", "TmsConfig", "PvcConfig", "McConfig")

    ## Get all the past config data saved and return 
    ## any of them with a name
    #
    # @return
    def get(self):

        

        #declare tuple of all special config names

        #declare dictionary for returning data
        configData={}
        #loop through each table and pull the names
        #0 used as a place holder, no args needed
        #TODO Test once db is setup
        #can't use the %s for table names
        for i in self.configNames:
            sqlCommand = f"SELECT name FROM {i} WHERE name IS NOT NULL"
            configData[i] = utils.exec_get_all(sqlCommand, [0,])  
    
        return jsonify(configData)

    def put(self):
        # Get JSON data from the request
        data = request.get_json()

        sqlCommands = [
            "INSERT into BmsConfig (id, hardwareRevision, softwareCommitHash, totalVoltageUnits, batteryVoltageUnits, currentUnits, packTempUnits, bqTempUnits, cellVoltageUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into ImuConfig (id, hardwareRevision, softwareCommitHash, eulerUnits, gyroUnits, linearAccelerationUnits, accelerometerUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into TmuConfig (id, hardwareRevision, softwareCommitHash, thermUnits) VALUES (DEFAULT, %s, %s, %s) RETURNING id",
            "INSERT into TmsConfig (id, hardwareRevision, softwareCommitHash, tempUnits, pumpSpeedUnits, fanSpeedUnits) VALUES (DEFAULT, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into PvcConfig (id, hardwareRevision, softwareCommitHash) VALUES (DEFAULT, %s, %s) RETURNING id",
            "INSERT into McConfig (id, model, firmwareVersion) VALUES (DEFAULT, %s, %s) RETURNING id"
        ]
        # Check if data was received
        if not data:
            return jsonify({"error": "No data provided"}), 400
        #Get the important piece of the data
        contextValue = data["Context"]
        #loop through each config and check if they have a selected 
        #config instead of a new one
        for index in range(0, len(self.configNames)):
            currentConfigData = contextValue[self.configNames[index]]
            if not "selected" in currentConfigData:
                idBikeConfig.append(utils.exec_commit_with_id(sqlCommands[index], self.DictToTuple(currentConfigData))[0][0])
            else:
                print("No")
        #establish sql commands for all non event, bike, and context configs

        sqlEvent = "INSERT into Event (id, eventDate, eventType, location) VALUES (DEFAULT, %s, %s, %s) RETURNING id"
        sqlBikeConfig = "INSERT into BikeConfig (id, platformName, tirePressure, coolantVolume, bmsConfigId, imuConfigId, tmuConfigId, tmsConfigId, pvcConfigId, mcConfigId) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"

        sqlContext = "INSERT into Context (id, airTemp, humidity, windSpeed, windAngle, riderName, riderWeight, driverFeedback, distanceCovered, startTime, eventId, bikeConfigId) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"

        eventAndBikeId=[]
        idBikeConfig=[]

        return jsonify({"We got data":"Yay"})    
        #save the event and bike ids for to reference in the context db
        eventAndBikeId.append(utils.exec_commit_with_id(sqlEvent, self.DictToTuple(contextValue["MainBody"]))[0][0])
        eventAndBikeId.append(utils.exec_commit_with_id(sqlBikeConfig, self.DictToTuple(contextValue["Event"])+tuple(idBikeConfig))[0][0])

        utils.exec_commit_with_id(sqlContext, self.DictToTuple(contextValue["BikeConfig"])+tuple(eventAndBikeId))

        # Respond back to the client
        return jsonify({"message": "Data received successfully", "received": data}), 200
    
    ## Convert a dictionary to a python tuple
    ## And remove the first value
    #
    #@param dictObject object to convert to tuple
    #@return tuple of dictionary values without the first value
    def DictToTuple(dictObject):
        return tuple(dictObject.values())
        



        
        