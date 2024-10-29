CREATE VIEW Tms_TempFrame AS
(
SELECT firstTemp.val  AS TempSensorOne,
       secondTemp.val AS TempSensorTwo,
       thirdTemp.val  AS TempSensorThree,
       fourthTemp.val AS TempSensorFour,
       firstTemp.contextId,
       firstTemp.receiveTime
FROM TmsSensorTemp AS firstTemp
         FULL JOIN (SELECT val, receiveTime, contextId FROM TmsSensorTemp WHERE sensorId = 2) AS secondTemp
                   ON firstTemp.receivetime = secondTemp.receivetime AND firstTemp.contextid = secondTemp.contextId
         FULL JOIN (SELECT val, receiveTime, contextId FROM TmsSensorTemp WHERE sensorId = 3) AS thirdTemp
                   ON firstTemp.receivetime = thirdTemp.receivetime AND firstTemp.contextid = thirdTemp.contextId
         FULL JOIN (SELECT val, receiveTime, contextId FROM TmsSensorTemp WHERE sensorId = 4) AS fourthTemp
                   ON firstTemp.receivetime = fourthTemp.receivetime AND firstTemp.contextid = fourthTemp.contextId
WHERE sensorId = 1
    );

CREATE VIEW Tms_Fan_Frame AS
(
SELECT firstFan.val AS fanSensorOne, secondFan.val AS fanSensorTwo, firstFan.contextId, firstFan.receiveTime
FROM TmsFanSpeed AS firstFan
         FULL JOIN (SELECT val, receiveTime, contextId FROM TmsFanSpeed WHERE fanid = 2) AS secondFan
                   ON firstFan.receivetime = secondFan.receivetime AND firstFan.contextid = secondFan.contextId
WHERE fanId = 1
    );

CREATE VIEW Imu_Accel_Frame AS
(
SELECT
    DISTINCT (xComponent.id) AS XId,
    xComponent.receivetime AS XRecieve,
    xComponent.val         AS Xvalue,
    yComponent.id AS YId,
    yComponent.receivetime AS YRecieve,
    yComponent.val         AS Yvalue,
    zComponent.id AS ZId,
    zComponent.receivetime AS ZRecieve,
    zComponent.val         AS Zvalue,
    xComponent.contextid   AS ContextId
FROM imuaccelerometercomponent AS xComponent
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imuaccelerometercomponent
            WHERE axis = 'y') AS yComponent
            ON yComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = yComponent.contextId
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imuaccelerometercomponent
            WHERE axis = 'z') AS zComponent
            ON zComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = zComponent.contextId
WHERE xComponent.axis = 'x'
ORDER BY xComponent.receivetime
    );

CREATE VIEW Imu_Gyro_Frame AS
(
SELECT
    DISTINCT (xComponent.id) AS XId,
    xComponent.receivetime AS XRecieve,
    xComponent.val         AS Xvalue,
    yComponent.id AS YId,
    yComponent.receivetime AS YRecieve,
    yComponent.val         AS Yvalue,
    zComponent.id AS ZId,
    zComponent.receivetime AS ZRecieve,
    zComponent.val         AS Zvalue,
    xComponent.contextid   AS ContextId
FROM imugyrocomponent AS xComponent
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imugyrocomponent
            WHERE axis = 'y') AS yComponent
            ON yComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = yComponent.contextId
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imugyrocomponent
            WHERE axis = 'z') AS zComponent
            ON zComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = zComponent.contextId
WHERE xComponent.axis = 'x'
ORDER BY xComponent.receivetime
    );

CREATE VIEW Imu_Linear_Frame AS
(
SELECT
    DISTINCT (xComponent.id) AS XId,
    xComponent.receivetime AS XRecieve,
    xComponent.val         AS Xvalue,
    yComponent.id AS YId,
    yComponent.receivetime AS YRecieve,
    yComponent.val         AS Yvalue,
    zComponent.id AS ZId,
    zComponent.receivetime AS ZRecieve,
    zComponent.val         AS Zvalue,
    xComponent.contextid   AS ContextId
FROM imulinearaccelerationcomponent AS xComponent
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imulinearaccelerationcomponent
            WHERE axis = 'y') AS yComponent
            ON yComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = yComponent.contextId
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imulinearaccelerationcomponent
            WHERE axis = 'z') AS zComponent
            ON zComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = zComponent.contextId
WHERE xComponent.axis = 'x'
ORDER BY xComponent.receivetime
    );

CREATE VIEW Imu_Euler_Frame AS
(
SELECT
    DISTINCT (xComponent.id) AS XId,
    xComponent.receivetime AS XRecieve,
    xComponent.val         AS Xvalue,
    yComponent.id AS YId,
    yComponent.receivetime AS YRecieve,
    yComponent.val         AS Yvalue,
    zComponent.id AS ZId,
    zComponent.receivetime AS ZRecieve,
    zComponent.val         AS Zvalue,
    xComponent.contextid   AS ContextId
FROM imueulercomponent AS xComponent
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imueulercomponent
            WHERE axis = 'y') AS yComponent
            ON yComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = yComponent.contextId
        FULL JOIN (SELECT id, axis, val, receiveTime, contextId
            FROM imueulercomponent
            WHERE axis = 'z') AS zComponent
            ON zComponent.receivetime between xComponent.receivetime AND xComponent.receivetime + 0.05 AND
            xComponent.contextid = zComponent.contextId
WHERE xComponent.axis = 'x'
ORDER BY xComponent.receivetime
    );

CREATE VIEW BMS_Cell_Voltage AS
    (SELECT
    array(
        SELECT val
        FROM
            bmscellvoltage
        WHERE
            firstCell.contextId = contextid
        AND firstCell.packid = packid
        AND receivetime BETWEEN  firstCell.receivetime AND firstCell.receivetime+1) AS aggOne,
       firstCell.contextId,
       firstCell.receiveTime AS firstPacketRecieveTime,
       fifthCell.receiveTime AS secondPacketRecieveTime,
       ninthCell.receiveTime AS thirdPacketRecieveTime,
       firstCell.packid
FROM bmscellvoltage AS firstCell
         FULL JOIN (SELECT val, receiveTime, contextId, packid FROM bmscellvoltage WHERE cellid = 5) AS fifthCell
                   ON fifthCell.receivetime between firstCell.receivetime AND firstCell.receivetime + 1 AND firstCell.contextid = fifthCell.contextId AND firstCell.packid = fifthCell.packid
         FULL JOIN (SELECT val, receiveTime, contextId, packid FROM bmscellvoltage WHERE cellid = 9) AS ninthCell
                   ON ninthCell.receivetime between firstCell.receivetime AND firstCell.receivetime + 1 AND firstCell.contextid = ninthCell.contextId AND firstCell.packid = ninthCell.packid
WHERE cellid = 1
)