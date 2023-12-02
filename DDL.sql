CREATE TABLE bikeConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    distanceCovered INTEGER NOT NULL
);

CREATE TABLE parts(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    weight FLOAT NOT NULL
);

CREATE TABLE BMSConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    totalVoltageUnits TEXT DEFAULT NULL,
    batteryVoltageUnits TEXT DEFAULT NULL,
    currentUnits TEXT DEFAULT NULL,
    thermistorTempUnits TEXT DEFAULT NULL,
    packTempUnits TEXT DEFAULT NULL,
    bqTempUnits TEXT DEFAULT NULL,
    cellVoltageUnits TEXT DEFAULT NULL
);

CREATE TABLE IMUConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    vectorUnits TEXT DEFAULT NULL
);

CREATE TABLE TMUConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    thermUnits TEXT NOT NULL
);

CREATE TABLE TMSConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sensorTempUnits TEXT NOT NULL,
    pumpSpeedUnits TEXT NOT NULL,
    fanSpeedUnits TEXT NOT NULL
);

CREATE TABLE PVCConfig(
    ID SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE BikeBoardConfig(
    bikeConfigID INTEGER,
    boardConfig INTEGER,
    PRIMARY KEY ( bikeConfigID, boardConfig)
);

CREATE TABLE BikePartConfig(
    ID SERIAL PRIMARY KEY,
    bikeConfigId INTEGER NOT NULL,
    partNumber TEXT NOT NULL
);

CREATE TABLE Context(
    ID SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    runEventType TEXT NOT NULL,
    airTemp INTEGER DEFAULT NULL,
    altitude INTEGER DEFAULT NULL,
    location TEXT NOT NULL,
    windVelocity FLOAT DEFAULT NULL,
    riderOne TEXT NOT NULL,
    riderTwo TEXT DEFAULT NULL,
    riderOneCurrentWeight FLOAT NOT NULL,
    riderTwoCurrentWeight FLOAT DEFAULT NULL,
    humidity FLOAT DEFAULT NULL,
    driverFeedback TEXT DEFAULT NULL
);

CREATE TABLE BMSNumAttemptsMade(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSNumThermAttemptsMade(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP NOT NULL
);

CREATE TABLE BMSLastAttemptTime(
    ID SERIAL PRIMARY KEY,
    time INTEGER NOT NULL,
    timeStamp TIMESTAMP NOT NULL,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSThermAttemptTime(
    ID SERIAL PRIMARY KEY,
    time INTEGER NOT NULL,
    timeStamp TIMESTAMP NOT NULL,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSTotalVoltage(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSBatteryVoltage(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSCurrent(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSThermistorTemp(

    ID SERIAL,
    thermNumber INTEGER,
    PRIMARY KEY (ID, thermNumber),
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSMinPackTemp(
    ID SERIAL PRIMARY KEY,
    value INTEGER,
    packId INTEGER,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSMaxPackTemp(
    ID SERIAL PRIMARY KEY,
    value INTEGER,
    packId INTEGER,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSBqInternalTemp(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSBqTemp(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    bqId INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSCellVoltage(
    ID SERIAL,
    cellId INTEGER,
    PRIMARY KEY (ID, cellId),
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSMinCellVoltage(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    cellId INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSMaxCellVoltage(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    cellId INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSBqStatus(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSErrorRegister(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE BMSLastCheckedThermNum(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE IMUVector(
    ID SERIAL PRIMARY KEY,
    vectorComponent TEXT NOT NULL,
    eulerVector INTEGER DEFAULT NULL,
    gyroscopeVector INTEGER DEFAULT NULL,
    linearAccelerationVector INTEGER DEFAULT NULL,
    accelerometerVector INTEGER DEFAULT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE TMUThermistorTemp(
    ID SERIAL PRIMARY KEY,
    thermistorOneTemp INTEGER DEFAULT NULL,
    thermistorTwoTemp INTEGER DEFAULT NULL,
    thermistorThreeTemp INTEGER DEFAULT NULL,
    thermistorFourTemp INTEGER DEFAULT NULL,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE TMSSensorTemp(
    ID SERIAL,
    sensorId INTEGER,
    PRIMARY KEY (ID, sensorId),
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE TMSPumpSpeed(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE TMSFanSpeed(
    ID SERIAL,
    fanId INTEGER,
    PRIMARY KEY (ID, fanId),
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);

CREATE TABLE PVCState(
    ID SERIAL PRIMARY KEY,
    value INTEGER NOT NULL,
    timeStamp TIMESTAMP,
    context_id INTEGER REFERENCES Context
);
