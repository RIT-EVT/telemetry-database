
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

Call Specifics
----------------------

get()
~~~~~~~~~~~~~~~~~~~~~

Returns:

.. code-block:: json

    {
        "data": {
            "bike": [],
            "bms": [],
            "imu": [],
            "tmu": [],
            "tms": [],
            "pvc": [],
            "mc": [],
        }
    }

post()
~~~~~~~~~~~~~~~~~~~~~

Takes:

.. code-block:: json

    {
        "configData": [],
    }

``configData`` is a list of any of the component JSON Schema's.

delete()
~~~~~~~~~~~~~~~~~~~~~

Takes:

.. code-block:: json

    {
        "configData": [
            {
                "name": "string",
                "type": "string",
            },
        ],
    }

Godot Type Aliases
------------------

.. _StringName:

.. cpp:type:: StringName

   Alias for ``godot::StringName``.

.. _String:

.. cpp:type:: String

   Alias for ``godot::String``.

.. _Callable:

.. cpp:type:: Callable

   Alias for ``godot::Callable``.

.. _`GDArray<T>`:

.. cpp:type:: template<typename T> GDArray

   Template alias for ``godot::TypedArray<T>``.

Macros
~~~~~~~~~~~~~~~~~~~~~~

Godot Class Definitions
-----------------------

.. _RefCounted:

.. c:macro:: RefCounted

   Expands to ``godot::RefCounted``.

.. _bind_method:

.. c:macro:: bind_method

   Expands to ``godot::ClassDB::bind_method``.

.. _D_METHOD:

.. c:macro:: D_METHOD

   Expands to ``godot::D_METHOD``.

.. _Object:

.. c:macro:: Object

   Expands to ``godot::Object``.

.. _RefCount:

.. c:macro:: RefCount

   Expands to ``godot::RefCount``.

.. _Ref:

.. c:macro:: Ref

   Expands to ``godot::Ref``.

Memory Management
-----------------

.. _`SafeDelete(p)`:

.. c:macro:: SafeDelete(p)

   Deletes pointer ``p`` if non-null and assigns it to ``nullptr``.

.. _`SafeDeleteArray(p)`:

.. c:macro:: SafeDeleteArray(p)

   Deletes array pointer ``p`` using ``delete[]`` if non-null and assigns it to ``nullptr``.

Structures & Functors
~~~~~~~~~~~~~~~~~~~~~~

.. _StringNameHash:

.. cpp:struct:: StringNameHash

   Hash functor for enabling ``godot::StringName`` usage in standard hash-based containers (e.g., ``std::unordered_map``).

   .. cpp:function:: size_t operator()(const StringName& name) const

      Calls ``name.hash()`` to generate a hash value.

.. _StringNameEqual:

.. cpp:struct:: StringNameEqual

   Equality comparison functor for ``godot::StringName``.

   .. cpp:function:: bool operator()(const StringName& a, const StringName& b) const

      Evaluates whether ``a == b``.

Functions
~~~~~~~~~~

.. _copy:

.. cpp:function:: inline void copy(const char a[], char*& b, uint* len)

   Copies a null-terminated C-style string into a newly dynamically allocated buffer.

   :param a: Source null-terminated string array.
   :param b: Output reference pointer where allocated buffer memory is stored.
   :param len: Output pointer set to the string length (excluding the null terminator).