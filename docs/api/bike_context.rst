
Bike Context API
=============================

This defines what format the bike config api is expecting data to be and the format that it returns data in.

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