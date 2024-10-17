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
SELECT xAxis.val  AS XAxisComponent,
       yAxis.val AS YAxisComponent,
       zAxis.val  AS ZAxisComponent,
       xAxis.contextId,
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