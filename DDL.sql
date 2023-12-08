CREATE TABLE BikeInfo(
    id                  SERIAL PRIMARY KEY,
    name                TEXT NOT NULL,
    distanceCovered     INTEGER NOT NULL
);

CREATE TABLE Part(
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL,
    weight  FLOAT NOT NULL
);

CREATE TABLE BMSConfig(
    id                  SERIAL PRIMARY KEY,
    name                TEXT NOT NULL,
    totalVoltageUnits   TEXT NOT NULL,
    batteryVoltageUnits TEXT NOT NULL,
    currentUnits        TEXT NOT NULL,
    thermistorTempUnits TEXT NOT NULL,
    packTempUnits       TEXT NOT NULL,
    bqTempUnits         TEXT NOT NULL,
    cellVoltageUnits    TEXT NOT NULL
);

CREATE TABLE IMUConfig(
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    vectorUnits TEXT NOT NULL
);

CREATE TABLE TMUConfig(
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    thermUnits  TEXT NOT NULL
);

CREATE TABLE TMSConfig(
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    sensorTempUnits TEXT NOT NULL,
    pumpSpeedUnits  TEXT NOT NULL,
    fanSpeedUnits   TEXT NOT NULL
);

CREATE TABLE PVCConfig(
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL
);

CREATE TABLE BikeBoardConfig(
    bikeInfoid  INTEGER,
    boardConfig INTEGER,
    PRIMARY KEY ( bikeInfoid, boardConfig)
);

CREATE TABLE BikePartConfig(
    id          SERIAL PRIMARY KEY,
    bikeInfoid  INTEGER NOT NULL,
    partNumber  TEXT NOT NULL
);

CREATE TABLE Context(
    id                      SERIAL PRIMARY KEY,
    contextDate             DATE NOT NULL,
    runEventType            TEXT NOT NULL,
    airTemp                 INTEGER DEFAULT NULL,
    altitude                INTEGER DEFAULT NULL,
    location                TEXT NOT NULL,
    windSpeed               FLOAT DEFAULT NULL,
    windDirection           TEXT DEFAULT NULL,
    riderOne                TEXT NOT NULL,
    riderTwo                TEXT DEFAULT NULL,
    riderOneCurrentWeight   FLOAT NOT NULL,
    riderTwoCurrentWeight   FLOAT DEFAULT NULL,
    humidity                FLOAT DEFAULT NULL,
    driverFeedback          TEXT DEFAULT NULL
);

CREATE TABLE BMSTotalVoltage(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSBatteryVoltage(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSCurrent(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSThermistorTemp(
    id          SERIAL,
    thermNumber INTEGER,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id),
    PRIMARY KEY (id, thermNumber)
);

CREATE TABLE BMSMinPackTemp(
    id          SERIAL PRIMARY KEY,
    value       INTEGER,
    packid      VARCHAR(2),
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSMaxPackTemp(
    id          SERIAL PRIMARY KEY,
    value       INTEGER,
    packid      INTEGER,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSBqInternalTemp(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSBqTemp(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    bqid        INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSCellVoltage(
    PRIMARY KEY (id, cellid),
    id          SERIAL,
    cellid      INTEGER,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSMinCellVoltage(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    cellid      INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSMaxCellVoltage(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    cellid      INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSBqStatus(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSErrorRegister(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE BMSLastCheckedThermNum(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE IMUVector(
    id                          SERIAL PRIMARY KEY,
    vectorComponent             TEXT NOT NULL,
    eulerVector                 INTEGER DEFAULT NULL,
    gyroscopeVector             INTEGER DEFAULT NULL,
    linearAccelerationVector    INTEGER DEFAULT NULL,
    accelerometerVector         INTEGER DEFAULT NULL,
    moment                      TIMESTAMP,
    contextId                   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TMUThermistorTemp(
    id                  SERIAL PRIMARY KEY,
    thermistorOneTemp   INTEGER DEFAULT NULL,
    thermistorTwoTemp   INTEGER DEFAULT NULL,
    thermistorThreeTemp INTEGER DEFAULT NULL,
    thermistorFourTemp  INTEGER DEFAULT NULL,
    contextId           INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TMSSensorTemp(
    PRIMARY KEY (id, sensorid),
    id          SERIAL,
    sensorid    INTEGER,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TMSPumpSpeed(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE TMSFanSpeed(
    PRIMARY KEY (id, fanid),
    id          SERIAL,
    fanid       INTEGER,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);

CREATE TABLE PVCState(
    id          SERIAL PRIMARY KEY,
    value       INTEGER NOT NULL,
    moment      TIMESTAMP,
    contextId   INTEGER NOT NULL,
    FOREIGN KEY (contextId) REFERENCES Context(id)
);
