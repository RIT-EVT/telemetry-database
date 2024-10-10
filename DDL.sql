CREATE TABLE BmsConfig(
    id                  SERIAL PRIMARY KEY,
    configName          TEXT NOT NULL,
    hardwareRevision    TEXT NOT NULL,
    softwareCommitHash  TEXT NOT NULL,
    totalVoltageUnits   TEXT NOT NULL,
    batteryVoltageUnits TEXT NOT NULL,
    currentUnits        TEXT NOT NULL,
    packTempUnits       TEXT NOT NULL,
    bqTempUnits         TEXT NOT NULL,
    cellVoltageUnits    TEXT NOT NULL
);

CREATE TABLE ImuConfig(
    id                      SERIAL PRIMARY KEY,
<<<<<<< HEAD
    configName          TEXT NOT NULL,
=======
    configName              TEXT NOT NULL,
>>>>>>> origin
    hardwareRevision        TEXT NOT NULL,
    softwareCommitHash      TEXT NOT NULL,
    eulerUnits              TEXT NOT NULL,
    gyroUnits               TEXT NOT NULL,
    linearAccelerationUnits TEXT NOT NULL,
    accelerometerUnits      TEXT NOT NULL
);

CREATE TABLE TmuConfig(
    id                 SERIAL PRIMARY KEY,
<<<<<<< HEAD
    configName          TEXT NOT NULL,
=======
    configName         TEXT NOT NULL,
>>>>>>> origin
    hardwareRevision   TEXT NOT NULL,
    softwareCommitHash TEXT NOT NULL,
    thermUnits         TEXT NOT NULL
);

CREATE TABLE TmsConfig(
    id                 SERIAL PRIMARY KEY,
<<<<<<< HEAD
    configName          TEXT NOT NULL,
=======
    configName         TEXT NOT NULL,
>>>>>>> origin
    hardwareRevision   TEXT NOT NULL,
    softwareCommitHash TEXT NOT NULL,
    tempUnits          TEXT NOT NULL,
    pumpSpeedUnits     TEXT NOT NULL,
    fanSpeedUnits      TEXT NOT NULL
);

CREATE TABLE PvcConfig(
    id                 SERIAL PRIMARY KEY,
<<<<<<< HEAD
    configName          TEXT NOT NULL,
=======
    configName         TEXT NOT NULL,
>>>>>>> origin
    hardwareRevision   TEXT NOT NULL,
    softwareCommitHash TEXT NOT NULL
);

-- TODO: Add detail
CREATE TABLE McConfig(
    id              SERIAL PRIMARY KEY,
<<<<<<< HEAD
    configName          TEXT NOT NULL,
=======
    configName      TEXT NOT NULL,
>>>>>>> origin
    model           TEXT NOT NULL,
    firmwareVersion TEXT NOT NULL
);

CREATE TABLE BikeConfig(
    id            SERIAL PRIMARY KEY,
    configName    TEXT NOT NULL,
    platformName  TEXT NOT NULL,
    tirePressure  FLOAT DEFAULT NULL,
    coolantVolume FLOAT DEFAULT NULL,
    bmsConfigId   INTEGER NOT NULL,
    imuConfigId   INTEGER DEFAULT NULL,
    tmuConfigId   INTEGER DEFAULT NULL,
    tmsConfigId   INTEGER NOT NULL,
    pvcConfigId   INTEGER NOT NULL,
    mcConfigId    INTEGER NOT NULL,
    FOREIGN KEY (bmsConfigId) REFERENCES BmsConfig(id),
    FOREIGN KEY (imuConfigId) REFERENCES ImuConfig(id),
    FOREIGN KEY (tmuConfigId) REFERENCES TmuConfig(id),
    FOREIGN KEY (tmsConfigId) REFERENCES TmsConfig(id),
    FOREIGN KEY (pvcConfigId) REFERENCES PvcConfig(id),
    FOREIGN KEY (mcConfigId)  REFERENCES McConfig(id)
);

CREATE TABLE Part(
    partNumber INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    weight     FLOAT NOT NULL,
    imagePath  TEXT NOT NULL
);

CREATE TABLE PartInBikeConfig(
    bikeConfigId INTEGER,
    partNumber   INTEGER,
    PRIMARY KEY (bikeConfigId, partNumber),
    FOREIGN KEY (bikeConfigId) REFERENCES BikeConfig(id),
    FOREIGN KEY (partNumber)   REFERENCES Part(partNumber)
);

CREATE TABLE Event(
    id        SERIAL PRIMARY KEY,
    eventDate DATE NOT NULL,
    eventType TEXT NOT NULL,
    location  TEXT NOT NULL
);

CREATE TABLE Context(
    id              SERIAL PRIMARY KEY,
    airTemp         FLOAT DEFAULT NULL,
    humidity        FLOAT DEFAULT NULL,
    windSpeed       FLOAT DEFAULT NULL,
    windAngle       FLOAT DEFAULT NULL,
    riderName       TEXT NOT NULL,
    riderWeight     FLOAT DEFAULT NULL,
    driverFeedback  TEXT DEFAULT NULL,
    distanceCovered FLOAT NOT NULL,
    startTime       TIMESTAMP NOT NULL,
    eventId         INTEGER NOT NULL,
    bikeConfigId    INTEGER NOT NULL,
    FOREIGN KEY (eventId) REFERENCES Event(id),
    FOREIGN KEY (bikeConfigId) REFERENCES BikeConfig(id)
);

CREATE TABLE CanMessage(
    id          SERIAL PRIMARY KEY,
    busId       INTEGER NOT NULL,
    frameId     INTEGER NOT NULL,
    dataBytes   INTEGER ARRAY NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsBatteryVoltage(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsCurrent(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsBqTemp(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    tempId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsState(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsThermistorTemp(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    thermId     INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsErrorRegister(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsBqStatus(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BmsCellVoltage(
    id          SERIAL PRIMARY KEY,
    packId      INTEGER NOT NULL,
    cellId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE ImuEulerComponent(
    id          SERIAL PRIMARY KEY,
    axis        CHAR(1) NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE ImuGyroComponent(
    id          SERIAL PRIMARY KEY,
    axis        CHAR(1) NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE ImuLinearAccelerationComponent(
    id          SERIAL PRIMARY KEY,
    axis        CHAR(1) NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE ImuAccelerometerComponent(
    id          SERIAL PRIMARY KEY,
    axis        CHAR(1) NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TmuThermistorTemp(
    id          SERIAL PRIMARY KEY,
    thermId     INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TmuThermistorError(
    id          SERIAL PRIMARY KEY,
    thermId     INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TmsSensorTemp(
    id          SERIAL PRIMARY KEY,
--     sensorId  VARCHAR(30),
--     CONSTRAINT DSI CHECK (sensorId IN ('Between Motor Inverter', 'Radiator Fan 1', 'Radiator Fan 2','TMS Internal')),
    sensorId    INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TmsPumpSpeed(
    id          SERIAL PRIMARY KEY,
    pumpId      INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TmsFanSpeed(
    id          SERIAL PRIMARY KEY,
    fanId       INTEGER NOT NULL,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE PvcState(
    id          SERIAL PRIMARY KEY,
    val         INTEGER NOT NULL,
    receiveTime DECIMAL(11,6) NOT NULL,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);
