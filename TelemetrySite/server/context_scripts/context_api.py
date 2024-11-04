from flask import request, jsonify
from flask.views import MethodView
import utils
from psycopg2.sql import Identifier, SQL


class context_api(MethodView):
    savedConfigs = (
        "bmsConfig",
        "imuConfig",
        "tmuConfig",
        "tmsConfig",
        "pvcConfig",
        "mcConfig",
        "BikeConfig",
    )
    savedConfigsShort = ("bms", "imu", "tmu", "tms", "pvc", "mc", "bike")
    configNames = (
        "bmsConfig",
        "imuConfig",
        "tmuConfig",
        "tmsConfig",
        "pvcConfig",
        "mcConfig",
    )
    configShort = ("bms", "imu", "tmu", "tms", "pvc", "mc")

    ## Get all the past config data saved and return
    ## any of them with a name
    #
    # @return all saved past files
    def get(self):
        # declare dictionary for returning data
        configData = {}
        # loop through each table and pull the names
        # 0 used as a place holder, no args needed
        # can't use the %s for table names

        for i in range(0, len(self.savedConfigs)):
            format_array = [Identifier(self.savedConfigs[i].lower())]

            conn = utils.connect()
            cur = conn.cursor()
            # manually search and select all configNames
            cur.execute(SQL("SELECT configName FROM {}").format(*format_array))
            # Fetch all results and store them in configData
            configData[self.savedConfigsShort[i]] = [row[0] for row in cur.fetchall()]
            conn.commit()
            conn.close()

        return jsonify(configData).get_data(as_text=True), 200

    def post(self):
        # Get JSON data from the request
        data = request.get_json()
        sqlCommands = [
            "INSERT into BmsConfig (id, hardwareRevision, softwareCommitHash, totalVoltageUnits, batteryVoltageUnits, currentUnits, packTempUnits,"
            + "bqTempUnits, cellVoltageUnits, configName) VALUES (DEFAULT",
            "INSERT into ImuConfig (id, hardwareRevision, softwareCommitHash, eulerUnits, gyroUnits, linearAccelerationUnits, accelerometerUnits, configName)"
            + "VALUES (DEFAULT",
            "INSERT into TmuConfig (id, hardwareRevision, softwareCommitHash, thermUnits, configName) VALUES (DEFAULT",
            "INSERT into TmsConfig (id, hardwareRevision, softwareCommitHash, tempUnits, pumpSpeedUnits, fanSpeedUnits, configName) VALUES "
            + "(DEFAULT",
            "INSERT into PvcConfig (id, hardwareRevision, softwareCommitHash, configName) VALUES (DEFAULT",
            "INSERT into McConfig (id, model, firmwareVersion, configName) VALUES (DEFAULT",
        ]
        # Check if data was received
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Get the important piece of the data
        contextValue = data["Context"]

        bikeSaved = False
        if "selected" in contextValue["BikeConfig"]:
            bikeSaved = True

        eventAndBikeId = []
        idBikeConfig = []

        hasIMU = True
        hasTMU = True
        # ensure the bike isn't already saved
        if not bikeSaved:
            # loop through each config and check if they have a selected
            # config instead of a new one
            for index in range(0, len(self.configShort)):
                currentConfigData = contextValue[self.configShort[index]]
                if not "selected" in currentConfigData:
                    contextBodyValues = []
                    sqlCommand = sqlCommands[index]
                    for value in self.DictToTuple(currentConfigData):
                        sqlCommand += ", "
                        if not value == "":
                            contextBodyValues.append(value)
                            sqlCommand += "%s"
                        else:
                            sqlCommand += "DEFAULT"
                    sqlCommand += ") RETURNING id"

                    idBikeConfig.append(
                        utils.exec_commit_with_id(sqlCommand, tuple(contextBodyValues))[
                            0
                        ][0]
                    )
                else:
                    # execute a query to find the id where the name is the same as the passed name

                    if currentConfigData["selected"] == "":
                        if index == 1:
                            hasIMU = False
                        else:
                            hasTMU = False
                        continue
                    format_array = [Identifier(self.configNames[index].lower())]
                    conn = utils.connect()
                    cur = conn.cursor()
                    config_name = [currentConfigData["selected"]]

                    cur.execute(
                        SQL("SELECT id FROM {} WHERE configName = %s").format(
                            *format_array
                        ),
                        (*config_name,),
                    )
                    idBikeConfig.append(cur.fetchone()[0])

                    conn.commit()
                    conn.close()

        # establish sql commands for all non event, bike, and context configs
        # save the event and bike ids for to reference in the context db

        sqlEvent = "INSERT into Event (id, eventDate, eventType, location) VALUES (DEFAULT, %s, %s, %s) RETURNING id"

        eventAndBikeId.append(
            utils.exec_commit_with_id(
                sqlEvent, self.DictToTuple(contextValue["Event"])
            )[0][0]
        )

        # if the bike isn't a saved value
        if not bikeSaved:
            # create a new one
            sqlBikeConfig = """INSERT into BikeConfig (id,  platformName, tirePressure, 
            coolantVolume, configName, bmsConfigId, imuConfigId, tmuConfigId, tmsConfigId, 
            pvcConfigId, mcConfigId) VALUES (DEFAULT,  """

            contextBodyValues = []
            # loop to see if tirePressure and coolantVolume are null
            for value in self.DictToTuple(contextValue["BikeConfig"]):
                if not value == "":
                    contextBodyValues.append(value)
                    sqlBikeConfig += "%s, "
                else:
                    sqlBikeConfig += "DEFAULT, "

            # config name and bmsConfig format
            sqlBikeConfig += "%s, "

            # set imu and tmu to default as needed
            if hasIMU is True:
                sqlBikeConfig += "%s, "
            else:
                sqlBikeConfig += "DEFAULT, "

            if hasTMU is True:
                sqlBikeConfig += "%s, "
            else:
                sqlBikeConfig += "DEFAULT, "
            # add tms, pvc, and mc
            sqlBikeConfig += "%s, %s, %s) RETURNING id"

            eventAndBikeId.append(
                utils.exec_commit_with_id(
                    sqlBikeConfig,
                    tuple(contextBodyValues) + tuple(idBikeConfig),
                )[0][0]
            )

        else:
            # if it is saved, get the id
            sqlCommand = "SELECT id from BikeConfig WHERE configName = %s"
            eventAndBikeId.append(
                utils.exec_get_one(
                    sqlCommand,
                    [
                        contextValue["BikeConfig"]["selected"],
                    ],
                )[0]
            )

        sqlContext = """INSERT into Context (id, airTemp, humidity, windSpeed, windAngle,
        riderName, riderWeight, driverFeedback, distanceCovered, startTime, eventId, bikeConfigId) 
        VALUES (DEFAULT, """

        contextBodyValues = []
        for value in self.DictToTuple(contextValue["MainBody"]):
            if not value == "":
                contextBodyValues.append(value)
                sqlContext += "%s, "
            else:
                sqlContext += "DEFAULT, "
        sqlContext += "%s, %s) RETURNING id"

        utils.exec_commit_with_id(
            sqlContext,
            tuple(contextBodyValues) + tuple(eventAndBikeId),
        )

        # Respond back to the client. 201 code for created
        return jsonify({"message": "Data received successfully", "received": data}), 201

    def put(self):

        # setup later to adjust data
        return jsonify(["Put Called"])

    def delete(self):

        # setup later to deactivate data
        return jsonify(["Delete Called"])

    ## Convert a dictionary to a python tuple
    ## And remove the first value
    #
    # @param self Current object reference
    # @param dictObject object to convert to tuple
    # @return tuple of dictionary values without the first value
    def DictToTuple(self, dictObject):
        return tuple(dictObject.values())
