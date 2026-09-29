import cantools
from asammdf import MDF
import json
from more_itertools import sliced
import gridfs
import os
import copy
import bson

parsing_data_progress = [0]
uploading_data_progress = [0]


def submit_data(mf4_file, dbc_file, context_data, runOrderNumber, db):
    """
        Parse the data from binary to a readable state and begin upload

    Args:
        mf4_file (string): path to the mf4 file
        dbc_file (string): path to the dbc file
        context_data (Dictionary): context id for the data
        runOrderNumber (int): Which run this is in a larger group of runs
    """
    # reset progress so a previous run's "finished" state isn't reported
    parsing_data_progress[0] = 0
    uploading_data_progress[0] = 0

    fs = gridfs.GridFS(db)

    dbc_decoded = cantools.database.load_file(dbc_file)

    # get a dictionary of CAN id -> Board name
    can_id_values = get_board_names(dbc_decoded)
    # create an outline of how to read the data
    config_values = create_config(can_id_values, dbc_decoded)
    # turn data from CAN messages -> list
    data_values_json, signal_names = parse_data(mf4_file, config_values, can_id_values)

    context_data = json.loads(context_data)

    with open(mf4_file, "rb") as f:
        context_data["event"]["run"]["mf4File"] = fs.put(
            f, filename=os.path.basename(mf4_file)
        )

    with open(dbc_file, "rb") as f:
        context_data["event"]["run"]["dbcFile"] = fs.put(
            f, filename=os.path.basename(dbc_file)
        )
    context_data["event"]["run"]["orderNumber"] = runOrderNumber
    context_data["event"]["run"]["signals"] = list(signal_names)
    upload_data_in_chunks(context_data, data_values_json, db)


# MongoDB's hard document limit is 16 MB; stay safely below it
MAX_DOCUMENT_BYTES = 15_000_000
# rough per-entry overhead for the array index key / element header in BSON
ARRAY_ENTRY_OVERHEAD = 16


def upload_data_in_chunks(new_run_data, data_values_json, db):
    """
        Upload the data in chunks that are less than 16 mb.
        MongoDB does not allow any document to be above this value,
        so the data is split by its actual BSON size (~15 mb per document).

    Args:
        new_run_data (Dictionary): Context data
        data_values_json (List): New bike data to upload
    """
    collection_access_messages = db["messages"]

    # the context shared by every document (never carries messages or an _id)
    base_document = copy.deepcopy(new_run_data)
    base_document.pop("_id", None)
    base_document["event"]["run"]["messages"] = []
    base_size = len(bson.encode(base_document))

    total_entries = len(data_values_json)
    uploaded_entries = 0
    upload_section = 0

    def flush(chunk):
        document = copy.deepcopy(base_document)
        document["event"]["uploadSection"] = upload_section
        document["event"]["run"]["messages"] = chunk
        collection_access_messages.insert_one(document)

    chunk = []
    chunk_size = base_size

    for entry in data_values_json:
        entry_size = len(bson.encode(entry)) + ARRAY_ENTRY_OVERHEAD

        # current chunk is full, upload it and start the next one
        if chunk and chunk_size + entry_size > MAX_DOCUMENT_BYTES:
            flush(chunk)
            upload_section += 1
            uploaded_entries += len(chunk)
            uploading_data_progress[0] = uploaded_entries / total_entries
            chunk = []
            chunk_size = base_size

        chunk.append(entry)
        chunk_size += entry_size

    # upload whatever is left over
    if chunk:
        flush(chunk)

    uploading_data_progress[0] = 1


def get_board_names(dbc_database):
    """
    Correlates frame ids to board names
    Args:
        dbc_database (Dictionary): The loaded dbc file ready to be used

    Returns:
        Dictionary: Frame id to board name dictionary
    """
    config = {}

    # loop through every dbc entry and convert the frame id -> board name
    for msg in dbc_database.messages:
        if msg.senders:

            board_name = msg.senders[0]

            # VirtualNMTMaster isn't recorded yet, and doesn't seem to have any data
            if board_name == "VirtualNMTMaster":
                continue

            if not board_name:
                continue

            # Initialize board entry if not already present

            config[hex(msg.frame_id)] = board_name
    return config


def read_bits(number, starting_bit, final_bit):
    """
        Get the needed binary bits from a longer string of bits

    Args:
        number (int): Raw binary number to read
        starting_bit (int): bit to start reading from inclusive
        final_bit (int): bit to finish reading exclusive

    Returns:
        string: binary string of bits
    """
    binary_number = format(number, "08b")
    binary_string = binary_number[starting_bit:final_bit]
    return binary_string


def combine_binary(*numbers):
    """
        Combine bytes of binary data

    Args:
        number (Tuple): binary data to combine

    Returns:
        String: combined data
    """

    # Convert each number to an 8-bit binary string
    binary_list = [format(num, "08b") for num in numbers]

    # Reverse the order to combine from right to left
    binary_list.reverse()

    # Join the binary strings together
    combined_binary = "".join(binary_list)

    return combined_binary


def signed_bin_convert(x, size):
    """
    Convert an unsigned integer into a signed integer using two's complement.

    Args:
        x (int): The unsigned integer value.
        size (int): The bit-width of the value (e.g., 8 for a byte).

    Returns:
        int: The signed integer interpretation of x.
    """
    # Mask to extract the lower (size - 1) bits (the magnitude part)
    magnitude = x & ((1 << size - 1) - 1)

    # Mask to extract the sign bit (the highest bit in size bits)
    sign = x & (1 << size - 1)

    # If sign is set, subtract its value (2^(size-1)) → yields negative numbers
    # Otherwise, just returns the magnitude
    return magnitude - sign


def parse_data(mdf_path, config_values, id_to_name):
    """
        Convert .MF4 files to a list of CAN messages

    Args:
        mdf_path (string): Path to the MF4 file
        config_values (Dictionary): ID to extra data (Axis, signage, etc)
        id_to_name (Dictionary): Dictionary for can ID to board names

    Returns:
        List: CAN messages
    """

    # Load the MDF file
    mdf = MDF(mdf_path, memory_map=False)

    # Convert to a Pandas DataFrame
    df = mdf.to_dataframe()

    # Display the DataFrame
    values = df.values.tolist()
    timestamps = df.index.tolist()
    json_data = []

    # Save all unique signal names
    signal_names_hs = set()

    total_rows = len(df.index)

    for index in range(0, total_rows):

        parsing_data_progress[0] = index / total_rows if total_rows else 0

        row = values[index]
        can_id = int(row[1])
        can_id_hex = hex(can_id)
        if can_id_hex not in config_values:
            continue

        config_data = config_values[can_id_hex]

        # data_array comes in as a ndarray with 1 dimension
        # each entry is 1 byte / 8 bits of data
        data_list = row[5].tolist()

        board_name = id_to_name.get(can_id_hex, "null")

        # save the number of bytes/array indexes used by previous can messages to know where next ones begin
        # also save the number of bits used of the current byte if a message needs bits
        previous_bytes_used = 0
        previous_bits_used = 0

        for config_current in config_data:

            # get the number of bits for the current data
            data_length_bits = config_current["size"]

            # lets manipulate some data!
            # if there are more than one byte of data associated with a message,
            # the second byte comes first in binary

            if data_length_bits % 8 == 0:

                # get the length in bytes of the needed data
                number_of_needed_bytes = data_length_bits // 8

                # the frame is shorter than the DBC says, nothing more can be read
                if previous_bytes_used + number_of_needed_bytes > len(data_list):
                    break

                current_data_list = data_list[
                    previous_bytes_used : previous_bytes_used + number_of_needed_bytes
                ]

                raw_binary = combine_binary(*current_data_list)

                previous_bytes_used += number_of_needed_bytes

                if config_current["signage"] == "signed":
                    decimal_result = signed_bin_convert(
                        int(raw_binary, 2), data_length_bits
                    )
                else:
                    decimal_result = int(raw_binary, 2)

            else:
                # some of the data comes in bits
                # some toggles and states
                # the sum always adds up to a byte
                # if something uses 7 bits, something else will use the last bit

                if previous_bytes_used >= len(data_list):
                    break

                raw_result = read_bits(
                    data_list[previous_bytes_used],
                    previous_bits_used,
                    previous_bits_used + data_length_bits,
                )

                decimal_result = int(raw_result, 2)

                # increment the previous bits for the next time
                # also update bytes as needed. Some messages use both bits and bytes of data
                previous_bits_used += data_length_bits
                if previous_bits_used >= 8:
                    previous_bytes_used += 1
                    previous_bits_used = 0

            signal_name = config_current["table"]
            if (
                signal_name.find("ErrorRegister") != -1
                or signal_name.find("Manufacturer") != -1
            ):
                continue

            json_object = {
                "time": timestamps[index],
                "signal": signal_name,
                "canID": can_id_hex,
                "data": decimal_result,
                "board": board_name,
            }

            signal_names_hs.add(signal_name)

            # optional identifiers are saved as their own fields
            for optional_key in (
                "axis",
                "cellId",
                "packId",
                "thermId",
                "tempId",
                "fanId",
                "pumpId",
            ):
                if optional_key in config_current:
                    json_object[optional_key] = config_current[optional_key]

            json_data.append(json_object)

    mdf.close()
    parsing_data_progress[0] = 1
    return json_data, signal_names_hs


def get_board_name(sender):
    """
        Clean the board names. Parse BMS and ignore VirtualNMTMaster

    Args:
        sender (string): Name of board that is sending a message

    Returns:
        string: cleaned board name
    """
    if sender == "VirtualNMTMaster":  # Ignore VirtualNMTMaster
        return None
    if sender[:3] == "BMS":
        return sender[:3] + "X_" + sender[len(sender) - 1 :]
    return sender


def handle_bms(signal, sender):
    """
        Interpret BMS data

    Args:
        signal (Dictionary): Information about the CAN message
        sender (String): Board that sent the message

    Returns:
        Dictionary: Updated data
    """

    signal_name = signal.name
    # each signal has the cell id at separate spots and needs special parts
    cellId = None
    tempId = None

    if signal_name.find("BMS_Voltage_sub") != -1:

        cellId = int(signal_name[len(signal_name) - 1 :], 16)
        signal_name = signal_name[: len(signal_name) - 1]

    elif signal_name.find("BMS_Voltage") != -1:

        cellId = int(signal_name[len(signal_name) - 1 :], 16)
        signal_name = signal_name[: len(signal_name) - 2]

    elif (
        signal_name.find("BMS_Board_Temp") != -1
        or signal_name.find("BMS_Pack_Temp") != -1
    ):

        tempId = int(signal_name[len(signal_name) - 1 :], 10)
        signal_name = signal_name[: len(signal_name) - 2]

    elif signal_name.find("BQ_Temp") != -1:
        tempId = 1

    signal_to_table = {
        "BMS_Battery_Voltage": "BmsBatteryVoltage",
        "Battery_Status": "BmsBqStatus",
        "BMS_Voltage_sub": "BmsCellVoltage",
        "BMS_Voltage_Cell": "BmsCellVoltage",
        "BQ_Temp": "BmsBqTemp",
        "BMS_State": "BmsState",
        "BMS_Current": "BmsCurrent",
        "BMS_Board_Temp": "BmsBqTemp",
        "BMS_Pack_Temp": "BmsThermistorTemp",
    }

    # if signal isn't in the table, it currently isn't being recorded
    if signal_name in signal_to_table:
        signal_name = signal_to_table[signal_name]

    # packId is found in the bms name in the fourth position
    # BMS_X_Y - X is the packId
    entry = {
        "table": signal_name,
        "packId": sender[4],
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }

    # add the special cases
    if signal_name == "BmsCellVoltage":
        entry["cellId"] = cellId
    elif signal_name == "BmsThermistorTemp":
        entry["thermId"] = tempId
    elif signal_name == "BmsBqTemp":
        entry["tempId"] = tempId

    return entry


def handle_imu(signal):
    """
        Handle IMU data

    Args:
        signal (Dictionary): Information about the CAN message

    Returns:
        Dictionary: Updated data
    """

    signal_name = signal.name

    # map the possible signal names to their table names in the sql db
    signal_to_table = {
        "VECTOR_EULER": "ImuEulerComponent",
        "VECTOR_GYROSCOPE": "ImuGyroComponent",
        "VECTOR_LINEAR_ACCEL": "ImuLinearAccelerationComponent",
        "VECTOR_ACCELEROMETER": "ImuAccelerometerComponent",
    }

    axis = None

    # some imu CAN messages will have an axis in the last position

    if signal_name[: len(signal_name) - 2] in signal_to_table:
        axis = signal_name[len(signal_name) - 1 :].lower()
        signal_name = signal_name[: len(signal_name) - 2]
        signal_name = signal_to_table[signal_name]

    json_object = {
        "table": signal_name,
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }
    if axis:
        json_object["axis"] = axis
    return json_object


def handle_pvc(signal):
    """
        Handle PVC data

    Args:
        signal (Dictionary): Information about the CAN message

    Returns:
        Dictionary: Updated data
    """

    signal_name = signal.name
    signal_to_table = {"State": "PvcState"}

    if signal_name in signal_to_table:
        signal_name = signal_to_table[signal_name]

    return {
        "table": signal_name,
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }


def handle_tms(signal):
    """
        Handle TMS data

    Args:
        signal (Dictionary): Information about the CAN message

    Returns:
        Dictionary: Updated data
    """

    signal_name = signal.name

    if signal_name.find("Duty_Cycle") != -1:
        # no pump id seems to be present
        if signal_name.find("Pump") != -1:
            signal_name = "Pump_Duty_Cycle"
        else:
            fan_id = signal_name[5]
            signal_name = "Fan_Duty_Cycle"

    signal_to_table = {
        "Temp_TMS_Internal": "TmsSensorTemp",
        "Pump_Duty_Cycle": "TmsPumpSpeed",
        "Fan_Duty_Cycle": "TmsFanSpeed",
    }

    if signal_name in signal_to_table:
        signal_name = signal_to_table[signal_name]

    entry = {
        "table": signal_name,
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }
    if signal_name == "Fan_Duty_Cycle":
        entry["fanId"] = fan_id
    if signal_name == "Pump_Duty_Cycle":
        entry["pumpId"] = 1
    return entry


def create_config(board_names_json, dbc_file):
    """
        Create a config file to interpret data

    Args:
        board_names_json (Dictionary): CAN id to board names
        dbc_file (Dictionary): The data in the DBC file

    Returns:
        Dictionary: Config data
    """

    config = {}
    # Process each message and interpret how it should be read
    for msg in dbc_file.messages:
        # make sure the message actually exists
        if not msg.senders:
            continue

        # get the board name
        sender = msg.senders[0]
        board_name = get_board_name(sender)
        # if the board doesn't exist or is VirtualNMTMaster skip over it
        if not board_name:
            continue

        msg_config = []
        for signal in msg.signals:
            # each board name needs to be handled differently
            match sender[:3]:
                case "BMS":
                    # bms needs the full board name to find the packId
                    entry = handle_bms(signal, sender)
                case "IMU":
                    entry = handle_imu(signal)
                case "PVC":
                    entry = handle_pvc(signal)
                case "TMS":
                    entry = handle_tms(signal)
                case _:
                    entry = {
                        "table": signal.name,
                        "size": signal.length,
                        "signage": "signed" if signal.is_signed else "unsigned",
                    }

            if entry is not None:
                msg_config.append(entry)

        config[hex(msg.frame_id)] = msg_config

    # return the config dictionary,
    return config


## The function that makes the progress of data upload visible to the frontend
#
# @return dictionary with the current state the process is on and its percentage
def get_progress():
    """
        Get the progress of a current upload

    Returns:
        Int: Current progress of an upload
    """
    if parsing_data_progress[0] != 1:
        return {"Parsing Data": parsing_data_progress[0]}
    elif uploading_data_progress[0] != 1:
        return {"uploading data": uploading_data_progress[0]}

    parsing_data_progress[0] = 0
    uploading_data_progress[0] = 0

    return {"Finished": None}
