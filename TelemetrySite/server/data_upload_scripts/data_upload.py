from utils import connect
from psycopg2.sql import Identifier, SQL
import cantools
import can_decoder
import mdf_iter
from datetime import datetime
from tqdm import tqdm

progress_data = {}


## The function that sends data to the db
#
# @param data_path path to the mf4 file
# @param dbc_file path to the dbc file
# @param context_id context id for the data
def submit_data(data_path, dbc_file, context_id):

    dbc_decoded = cantools.database.load_file(dbc_file)

    # get a dictionary of CAN id -> Board name
    can_id_values = get_board_names(dbc_decoded)
    # create an outline of how to read the data
    config_values = createConfig(can_id_values, dbc_decoded)
    # turn data from CAN messages -> list
    data_values_json = parse_data(dbc_file, data_path)

    # establish values of progress of the upload for the frontend
    counter = 0
    data_length = len(data_values_json) - 1

    progress_data[context_id] = 0

    for data in tqdm(data_values_json):

        counter += 1
        # Update the progress of the upload system
        progress_data[context_id] = counter / data_length

        conn = connect()
        cur = conn.cursor()
        # if the data hasn't been parsed into the config file
        # ignore it, its data we are not currently recording
        if data["signal"] not in config_values:
            continue

        config_info = config_values[data["signal"]]

        # insert_string is the amount of data to insert into the table
        insert_string = ""

        # the actual data replacing the placeholders in insert_string
        data_insert_array = []

        # column_string is the actual columns to insert data into
        # column_string and insert_string should be the same length
        column_string = ""

        # the column names replacing the placeholder in column_string
        # eventually added to format_array to make one longer array
        insert_columns = []

        # final array to replace all {} in the unformatted SQL command
        format_array = []

        # define the table to insert data into
        format_array = [Identifier(config_info["table"].lower())]

        for index in config_info:
            # for all special column names (packId, cellId, axis)
            # insert name into column list and handle the data
            if (
                index != "table"
                and index != "signal"
                and index != "size"
                and index != "signage"
                and index != "frame"
            ):
                insert_string += "%s, "
                column_string += "{}, "
                insert_columns.append(index)

                data_insert_array.append(str(config_info[index]))

        insert_string += "%s, %s, %s"
        column_string += "{}, {}, {}"

        # insert all the rest of the data which is present in every CAN message
        insert_columns += ["val", "receivetime", "contextid"]
        data_insert_array += [data["value"], data["time"], context_id]

        # add each of the column names to be inserted
        # the order will match with the same order of data_insert_array
        for value in insert_columns:
            format_array.append(Identifier(value.lower()))

        cur.execute(
            SQL(
                "INSERT into {} (" + column_string + ")  VALUES (" + insert_string + ")"
            ).format(*format_array),
            (*data_insert_array,),
        )
        conn.commit()
        conn.close()


## The function that corelate frame id to board name
#
# @param dbc_database the loaded dbc file ready to be used
#
# @return dictionary of frame id -> board name
def get_board_names(dbc_database):
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


## The function that converts datetime to ms
#
# @param iso_timestamp timestamp to convert
#
# @return timestamp in ms
def timestamp_to_seconds(iso_timestamp):
    parsed_time = datetime.strptime(iso_timestamp, "%Y-%m-%d %H:%M:%S.%f%z")
    # get the current time of the bike since 1/1/1970 in ms
    return float(parsed_time.timestamp())


## The function that converts timestamps from datetime to ms since bike start
#
# @param time_stamps list of all timestamps currently in datetime
#
# @return list of timestamps in ms since bike start
def convert_time(time_stamps):

    # cut just the receive time out of the timestamp
    # first time stamp serves as the start time of the bike
    starting_timestamp = str(time_stamps[0])
    starting_time_seconds = timestamp_to_seconds(starting_timestamp)

    for index in range(0, len(time_stamps)):
        current_time_seconds = timestamp_to_seconds(str(time_stamps[index]))

        relative_time = current_time_seconds - starting_time_seconds
        # overwrite the previous timestamp data
        time_stamps[index] = relative_time
    return time_stamps


## The function that converts data from CAN to a list =
#
# @param dbc_path the path to the dbc file for the CAN data
# @param mdf_path the path to the mf4 file
#
# @return list form of CAN data
def parse_data(dbc_path, mdf_path):
    # df_decoder uses the dbc file to interpret the mf4 file
    # and read all the can messages in the oder they were sent
    db = can_decoder.load_dbc(dbc_path)
    df_decoder = can_decoder.DataFrameDecoder(db)

    with open(mdf_path, "rb") as handle:
        mdf_file = mdf_iter.MdfFile(handle)
        df_raw = mdf_file.get_data_frame()

    df_phys = df_decoder.decode_frame(df_raw)

    # take just the data value not including the time stamp
    # timestamp is saved as the index for the data
    mf4_values = df_phys.values.tolist()

    # time stamp is saved in YYYY/MM/DD : HH:MM:SS form
    # convert to ms and assume the first message is sent at 0.0 ms
    time_stamps = convert_time(df_phys.index.tolist())

    json_data = []

    # loop through each set of data in order and save it
    for index in range(0, len(mf4_values)):

        json_object = {}
        json_object["time"] = time_stamps[index]
        json_object["canID"] = hex(mf4_values[index][0])
        json_object["signal"] = mf4_values[index][1]
        json_object["value"] = mf4_values[index][2]

        # physicalValue doesn't seem to have a purpose
        # most of the time value == physicalValue, but sometime their values differ
        # json_object["physicalValue"] = mf4_values[index][3]
        json_data.append(json_object)
    return json_data


## Clean the board names
#
# @param sender raw name of board
#
# @return cleaned board name
def get_board_name(sender):

    if sender == "VirtualNMTMaster":  # Ignore VirtualNMTMaster
        return None
    if sender[:3] == "BMS":
        return sender[:3] + "X_" + sender[len(sender) - 1 :]
    return sender


## The function that interprets all BMS data
#
# @param signal information about the CAN message
# @param sender board that sent the message
#
# @return data entry
def handle_bms(signal, sender):

    signal_name = signal.name
    # each signal has the cell id at separate spots and needs special parts

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
    if signal_name not in signal_to_table:
        return None

    # packId is found in the bms name in the fourth position
    # BMS_X_Y - X is the packId
    entry = {
        "table": signal_to_table[signal_name],
        "packId": sender[4],
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }

    # add the special cases
    if signal_to_table[signal_name] == "BmsCellVoltage":
        entry["cellId"] = cellId
    elif signal_to_table[signal_name] == "BmsThermistorTemp":
        entry["thermId"] = tempId
    elif signal_to_table[signal_name] == "BmsBqTemp":
        entry["tempId"] = tempId

    return entry


## The function that handles the imu board messages
#
# @param signal information about the CAN message
#
# @return data entry
def handle_imu(signal):
    signal_name = signal.name

    # all imu CAN messages will have an axis in the last position

    axis = signal_name[len(signal_name) - 1 :].lower()
    signal_name = signal_name[: len(signal_name) - 2]

    # map the possible signal names to their table names in the sql db
    signal_to_table = {
        "VECTOR_EULER": "ImuEulerComponent",
        "VECTOR_GYROSCOPE": "ImuGyroComponent",
        "VECTOR_LINEAR_ACCEL": "ImuLinearAccelerationComponent",
        "VECTOR_ACCELEROMETER": "ImuAccelerometerComponent",
    }
    if signal_name not in signal_to_table:
        return None

    return {
        "table": signal_to_table[signal_name],
        "axis": axis,
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }


## The function that handle the pvc board messages
#
# @param signal information about the CAN message
#
# @return data entry
def handle_pvc(signal):

    signal_name = signal.name
    signal_to_table = {"State": "PvcState"}

    if signal_name not in signal_to_table:
        return None
    return {
        "table": signal_to_table[signal_name],
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }


## The function that handle the tms board messages
#
# @param signal information about the CAN message
#
# @return data entry
def handle_tms(signal):
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

    if signal_name not in signal_to_table:
        return None

    entry = {
        "table": signal_to_table[signal_name],
        "size": signal.length,
        "signage": "signed" if signal.is_signed else "unsigned",
    }
    if signal_name == "Fan_Duty_Cycle":
        entry["fanId"] = fan_id
    if signal_name == "Pump_Duty_Cycle":
        entry["pumpId"] = 1
    return entry


## The function that creates the configuration for for the data
#
# @param board_names_json dictionary of can signal -> board name
# @param dbc_file dbc file to interpret data
def createConfig(board_names_json, dbc_file):

    config = {}
    # Process each message and interpret how it should be read
    for msg in dbc_file.messages:
        # make sure the message actually exists
        if msg.senders:
            # get the board name
            sender = msg.senders[0]
            board_name = get_board_name(sender)
            # if the board doesn't exist or is VirtualNMTMaster skip over it
            if not board_name:
                continue

            for signal in msg.signals:
                entry = None
                # each board name needs to be handled differently
                match board_names_json[hex(msg.frame_id)][:3]:
                    case "BMS":
                        # bms needs the full board name to find the packId
                        entry = handle_bms(signal, sender)
                    case "IMU":
                        entry = handle_imu(signal)
                    case "PVC":
                        entry = handle_pvc(signal)

                if entry != None:
                    config[signal.name] = entry

    # return the config dictionary,
    return config


## The function that makes the progress of data upload visible to the frontend
#
# @param config_id config id to find the progress for
def get_progress(config_id):
    if not config_id in progress_data:
        return -1

    dataValue = progress_data[config_id]
    # remove value if data has been fully uploaded
    if dataValue == 1:
        progress_data.pop(config_id)
    return dataValue
