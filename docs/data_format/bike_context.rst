
Bike Context Format
=============================

This defines what format the bike config api is expecting data to be and the format that it returns data in.

Component JSON Schema
----------------------

Bike
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json

    {
        "name": "string",
        "type": "BIKE",
        "inactive": "boolean",
        "savedConfigs": {
            "bms": "string",
            "imu": "string",
            "tmu": "string",
            "tms": "string",
            "pvc": "string",
            "mc": "string",
        }, 
    }

Battery Management System
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "BMS",
        "inactive": "boolean",
        "hardwareRevision": "integer",
        "firmwareCommitHash": "integer",
        "data": {
            "totalVoltageUnits": "string",
            "batteryVoltageUnits": "string",
            "currentUnits": "string",
            "packTempUnits": "string",
            "bqTempUnits": "string",
            "cellVoltageUnits": "string",
        }, 
    }

Inertial Measurement Unit
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "IMU",
        "inactive": "boolean",
        "hardwareRevision": "integer",
        "firmwareCommitHash": "integer",
        "data": {
            "eulerUnits": "string",
            "gyroUnits": "string",
            "linearAccelerationUnits": "string",
            "accelerometerUnits": "string",
        }, 
    }

Thermal Management Unit
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "TMU",
        "inactive": "boolean",
        "hardwareRevision": "integer",
        "firmwareCommitHash": "integer",
        "data": {
            "thermalUnits": "string",
        }, 
    }

Thermal Management System
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "TMS",
        "inactive": "boolean",
        "hardwareRevision": "integer",
        "firmwareCommitHash": "integer",
        "data": {
            "tempUnits": "string",
            "pumpSpeedUnits": "string",
            "fanSpeedUnits": "string",  
        }, 
    }

Powertrain Voltage Controller
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "PVC",
        "inactive": "boolean",
        "hardwareRevision": "integer",
        "firmwareCommitHash": "integer",
    }

Motor Controller
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: json
    
    {
        "name": "string",
        "type": "MC",
        "inactive": "boolean",
        "data": {
            "model": "string",
            "firmwareVersion": "string", 
        },
    }