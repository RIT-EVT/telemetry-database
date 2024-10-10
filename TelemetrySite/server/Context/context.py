from flask import request, jsonify
from flask.views import MethodView
import utils


class Context(MethodView):
    configNames = ("bmsConfig", "imuConfig", "tmuConfig", "tmsConfig", "pvcConfig", "mcConfig")
    configShort = ("bms", "imu", "tmu", "tms", "pvc", "mc")

    ## Get all the past config data saved and return 
    ## any of them with a name
    #
    # @return all saved past files
    def get(self):
        #declare dictionary for returning data
        configData={}
        #loop through each table and pull the names
        #0 used as a place holder, no args needed
        #TODO Test once db is setup
        #can't use the %s for table names
        for i in range(0, len(self.configNames)):
            sqlCommand = f"SELECT configName FROM {self.configNames[i]} WHERE configName != '' AND configName IS NOT NULL"
            configData[self.configShort[i]] = utils.exec_get_all(sqlCommand, [0,])  
        #while(1); prevents json injections
        return "while(1);"+jsonify(configData).get_data(as_text=True), 200

    def put(self):
        # Get JSON data from the request
        data = request.get_json()
        sqlCommands = [
            "INSERT into BmsConfig (id, hardwareRevision, softwareCommitHash, totalVoltageUnits, batteryVoltageUnits, currentUnits, packTempUnits," 
            +"bqTempUnits, cellVoltageUnits, configName) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into ImuConfig (id, hardwareRevision, softwareCommitHash, eulerUnits, gyroUnits, linearAccelerationUnits, accelerometerUnits, configName)"
            +"VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into TmuConfig (id, hardwareRevision, softwareCommitHash, thermUnits, configName) VALUES (DEFAULT, %s, %s, %s, %s) RETURNING id",
            "INSERT into TmsConfig (id, hardwareRevision, softwareCommitHash, tempUnits, pumpSpeedUnits, fanSpeedUnits, configName) VALUES "
            +"(DEFAULT, %s, %s, %s, %s, %s, %s) RETURNING id",
            "INSERT into PvcConfig (id, hardwareRevision, softwareCommitHash, configName) VALUES (DEFAULT, %s, %s, %s) RETURNING id",
            "INSERT into McConfig (id, model, firmwareVersion, configName) VALUES (DEFAULT, %s, %s, %s) RETURNING id"
        ]
        # Check if data was received
        if not data:
            return jsonify({"error": "No data provided"}), 400
        #Get the important piece of the data
        contextValue = data["Context"]

        eventAndBikeId=[]
        idBikeConfig=[]

        hasIMU=True
        hasTMU=True

        #loop through each config and check if they have a selected 
        #config instead of a new one
        for index in range(0, len(self.configShort)):
            currentConfigData = contextValue[self.configShort[index]]
            if not "selected" in currentConfigData:           
                idBikeConfig.append(utils.exec_commit_with_id(sqlCommands[index], self.DictToTuple(currentConfigData))[0][0])
            else:
                #execute a query to find the id where the name is the same as the passed name
                query = f"SELECT id FROM {self.configNames[index]} WHERE configName = {currentConfigData["selected"]}"
                
                if currentConfigData["selected"]=="":
                    if index == 1:
                        hasIMU=False
                    else:
                        hasTMU=False
                    continue
                idBikeConfig.append(utils.exec_get_one(query, [0,])[0])
        
        #establish sql commands for all non event, bike, and context configs
        print(idBikeConfig)

        sqlEvent = "INSERT into Event (id, eventDate, eventType, location) VALUES (DEFAULT, %s, %s, %s) RETURNING id"
        sqlBikeConfig = "INSERT into BikeConfig (id, platformName, tirePressure, coolantVolume, bmsConfigId, imuConfigId, tmuConfigId, tmsConfigId, pvcConfigId, mcConfigId) VALUES (DEFAULT, %s, %s, %s, %s," 
        #set imu and tmu to default as needed
        if hasIMU is True:
            sqlBikeConfig+="%s, "
        else:
            sqlBikeConfig+="DEFAULT, "
        if hasTMU is True:
            sqlBikeConfig+="%s, "
        else:
            sqlBikeConfig+="DEFAULT, "
        
        idBikeConfig+="%s, %s, %s) RETURNING id"

        sqlContext = "INSERT into Context (id, airTemp, humidity, windSpeed, windAngle, riderName, riderWeight, driverFeedback, distanceCovered, startTime, eventId, bikeConfigId) VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"

        #save the event and bike ids for to reference in the context db
        eventAndBikeId.append(utils.exec_commit_with_id(sqlEvent, self.DictToTuple(contextValue["MainBody"]))[0][0])
        eventAndBikeId.append(utils.exec_commit_with_id(sqlBikeConfig, self.DictToTuple(contextValue["Event"])+tuple(idBikeConfig))[0][0])

        utils.exec_commit_with_id(sqlContext, self.DictToTuple(contextValue["BikeConfig"])+tuple(eventAndBikeId))

        # Respond back to the client. 201 code for created
        return jsonify({"message": "Data received successfully", "received": data}), 201
    

    def post(self):


        return jsonify(["Post Called"])
    
    def delete(self):


        return jsonify(["Delete Called"])


    ## Convert a dictionary to a python tuple
    ## And remove the first value
    #
    #@param self Current object reference
    #@param dictObject object to convert to tuple
    #@return tuple of dictionary values without the first value
    def DictToTuple(self, dictObject):
        return tuple(dictObject.values())
            