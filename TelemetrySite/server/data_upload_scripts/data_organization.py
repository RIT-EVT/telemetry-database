import psycopg2
import dotenv
import json
import os
from utils import connect, exec_get_all
from tqdm import tqdm
from psycopg2.sql import Identifier, SQL


config_file_path = "./data_upload_scripts/boardConfig.json"

UNKNOWN_COB_STRING = "Unknown COBID"

BMSX_0_TYPE_CONFIG = "BMSX_0"

BMSX_1_TYPE_CONFIG = "BMSX_1"

THROW_AWAY_CONFIG_STRING = "THROW_AWAY"

tpdo_dictionary = {
    "TPDO0": 0x180,
    "DEADZONE_1": 0x200,
    "TPDO1": 0x280,
    "DEADZONE_2": 0x300,
    "TPDO2": 0x380,
    "DEADZONE_3": 0x400,
    "TPDO3": 0x480,
    "DEADZONE_4": 0x500,
    "MAX_VAL": 0x580,
}


## Determined the board which sent the message and which TPDO sent it
#
# The board and tpdo can be determined by categorizing the frame id into one of the valid "zones" we track in our messages
# Following this we subtract the frame id from the "zone's" base value (i.e. 0x180, 0x280, 0x380, 0x480) the difference relates
# to a board in the nodeIdDictionary from the config
#
# @param id The frame id from the message
def determine_board_owner_and_cob(id, config):
    """Values based on the CAN Open standard. Each hex value relates to a TPDO message"""
    if id < tpdo_dictionary["TPDO0"]:
        return (UNKNOWN_COB_STRING, 0)
    elif id <= tpdo_dictionary["DEADZONE_1"]:
        default_COB_ID = tpdo_dictionary["TPDO0"]
    elif id <= tpdo_dictionary["TPDO1"]:
        return (UNKNOWN_COB_STRING, tpdo_dictionary["DEADZONE_1"])
    elif id <= tpdo_dictionary["DEADZONE_2"]:
        default_COB_ID = tpdo_dictionary["TPDO1"]
    elif id <= tpdo_dictionary["TPDO1"]:
        return (UNKNOWN_COB_STRING, tpdo_dictionary["DEADZONE_2"])
    elif id <= tpdo_dictionary["DEADZONE_3"]:
        default_COB_ID = tpdo_dictionary["TPDO2"]
    elif id <= tpdo_dictionary["TPDO3"]:
        return (UNKNOWN_COB_STRING, tpdo_dictionary["DEADZONE_3"])
    elif id <= tpdo_dictionary["DEADZONE_4"]:
        default_COB_ID = tpdo_dictionary["TPDO3"]
    else:
        return (UNKNOWN_COB_STRING, tpdo_dictionary["DEADZONE_4"])
    return (config["nodeIDDictionary"][str(id - default_COB_ID)], default_COB_ID)


## This is function is the main handler which processes the flow for the data being organized.
#
# @param can_data The full data object from the SQL Select statement
def handle_data(can_data):
    with open(config_file_path) as config_file:
        config = json.load(config_file)
        for x in tqdm(range(len(can_data)), ncols=80):
            data_tuple = can_data[x]

            frame_id = data_tuple[2]
            data_bytes = data_tuple[3]
            receive_time = data_tuple[4]
            context_id = data_tuple[5]
            board_owner, cob_id = determine_board_owner_and_cob(frame_id, config)

            if board_owner != UNKNOWN_COB_STRING and board_owner != "Motor Controller":
                if board_owner[:3] != "BMS":
                    tpdo_config = config[board_owner][hex(cob_id)]
                    upload_organized(tpdo_config, data_bytes, receive_time, context_id)
                else:
                    tpdo_config = handle_bms_config(config, board_owner, hex(cob_id))
                    upload_organized(tpdo_config, data_bytes, receive_time, context_id)


## The function which sends the data to the DB
#
# To prepare the data to send there are many steps. Refer to inline comments for more explination
#
# @param tpdo_config the individual config for the tpdo being handled
# @param data_bytes the bytes of data from the can message
# @param recieveTime the timestamp of the data as a decimal value
# @param context_id the context in which the data is being recorded
def upload_organized(tpdo_config, data_bytes, receive_time, context_id):
    conn = connect()
    cur = conn.cursor()
    binary_data_string = ""
    # Convert the bytes into a binary string (This makes it 8x bigger than before!)
    # This also fully reverses the string so we can handle the endian-ness of our data
    for data in data_bytes:
        binary_data_string = bin(data)[2:].zfill(8) + binary_data_string
    # Here we are extracting the information from the config file to figure out what our sql statement will look like
    for data_package in tpdo_config:
        insert_columns = []
        insert_string = ""
        column_string = ""
        data_insert_array = []
        table_to_insert = data_package["table"]
        # Some of our data is/can be redundant or not recorded in the DB that is reflected in the config with a string value which we check for here
        if table_to_insert != THROW_AWAY_CONFIG_STRING:
            data_size = data_package["size"]
            # Pop off the bits of size data_size from the front of binary_data_string
            binary_data_string, insert_data_string = extract_data_bytes_by_size(
                data_size, binary_data_string
            )
            # Convert the string version of the binary value into an actual numeric binary value
            if data_package["signage"] == "signed":
                insert_data_int = signed_bin_convert(
                    int(insert_data_string, 2), data_size
                )
            else:
                insert_data_int = int(insert_data_string, 2)
            # Find all of the keys in the data_package which arent table or size we want to make that a part of our sql insert
            for index in data_package.keys():
                if index != "table" and index != "size" and index != "signage":
                    insert_string += "%s, "
                    column_string += "{}, "
                    insert_columns.append(index)
                    data_insert_array.append(str(data_package[index]))
            # These values will always need to be in the insert statement so we add them after the magic that happens above
            insert_string += "%s, %s, %s"
            column_string += "{}, {}, {}"
            insert_columns += ["val", "receivetime", "contextid"]
            data_insert_array += [insert_data_int, str(receive_time), context_id]
            # Format array will be unpacked in the format call for the SQL statement it will store the names of the table and columns being Inserted into
            format_array = [Identifier(table_to_insert.lower())]

            for value in insert_columns:
                format_array.append(Identifier(value.lower()))
            # Run the SQL statement. There are a lot of weird python string things happening here. First we add the values for the table and columns
            # with the format call. After that the execute call will inject the data_insert_array into the %s-es.
            cur.execute(
                SQL(
                    "INSERT into {} ("
                    + column_string
                    + ")  VALUES ("
                    + insert_string
                    + ")"
                ).format(*format_array),
                (*data_insert_array,),
            )
    conn.commit()
    conn.close()


## Convert a signed binary value to the signed int
def signed_bin_convert(x, size):
    return (x & ((1 << size - 1) - 1)) - (x & (1 << size - 1))


## Take the given binary number string and remove values from the end of that string. Return the digit that was removed
#
# @param binary_data_string a string representation of a binary number.
# @param data_size The number of bits to be taken from the front of the binary_data_string
def extract_data_bytes_by_size(data_size, binary_data_string):
    data_string = binary_data_string[len(binary_data_string) - data_size :]
    binary_data_string = binary_data_string[: len(binary_data_string) - data_size]
    return binary_data_string, data_string


## The BMS is a special snowflake and therefore needs some extra processing before it's config can be read and/or used
#
# @param config The full json config
# @param board_owner Which BMS sent this. The string will look something like BMSX_X
# @param cob_id The TPDO number of the message
def handle_bms_config(config, board_owner, cob_id):
    try:

        temp_config = config
        if board_owner[-1] == "1":
            # Set the packId in the config to the value stored at board_owner[3] which is the number value for the pack Id according to the nodeIDDictionary
            for message in temp_config[BMSX_1_TYPE_CONFIG][cob_id]:
                message["packId"] = int(board_owner[3])
            return temp_config[BMSX_1_TYPE_CONFIG][cob_id]
        else:
            # Set the packId in the config to the value stored at board_owner[3] which is the number value for the pack Id according to the nodeIDDictionary
            for message in temp_config[BMSX_0_TYPE_CONFIG][cob_id]:
                message["packId"] = int(board_owner[3])
            return temp_config[BMSX_0_TYPE_CONFIG][cob_id]
    except KeyError:
        print(
            "WARNING KEY ERROR IN CONFIG Board: "
            + board_owner
            + " with COB_ID: "
            + cob_id
        )


## The SQL statement which gets the data and a call to handle that data
#
# Because this is a wrapper we are able to call handle_data directly with can_data without knowing a context_id.
# We want this to be possible so we can organize data without knowing its context
#
# @context_id The context shared by the data which needs to be organized
def organize_can_from_db(context_id):
    sql = "SELECT id, busId, frameid, databytes, receivetime, contextid FROM CANMESSAGE WHERE contextid = %s"
    can_data = exec_get_all(sql, (context_id,))
    handle_data(can_data)
