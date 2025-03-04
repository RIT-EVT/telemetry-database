import cantools
import pymongo
from asammdf import MDF
import json
from more_itertools import sliced
from bson import ObjectId
import os
import urllib
import gridfs

parsing_data_progress = [0]
uploading_data_progress = [0]

## Create a connection to the Mongo DB
#
# @return db connection object
def create_db_connection():
    connection_string = "mongodb://" + urllib.parse.quote_plus(str(os.getenv("MDB_USER"))) + ":" + urllib.parse.quote_plus(str(os.getenv("MDB_PASSWORD")))  + "@" + str(os.getenv("HOST")) + ":" + str(os.getenv("MDB_PORT"))
    mongo_client = pymongo.MongoClient(connection_string)
    
    db_access = mongo_client["ernie"]
    return db_access

## The function that sends data to the db
#
# @param data_path path to the mf4 file
# @param dbc_file path to the dbc file
# @param context_id context id for the data
def submit_data(mf4_file, dbc_file, context_data, runOrderNumber):
   
    db_connection = create_db_connection()
    fs = gridfs.GridFS(db_connection)
    

    dbc_decoded = cantools.database.load_file(dbc_file)

    # get a dictionary of CAN id -> Board name
    can_id_values = get_board_names(dbc_decoded)
    # create an outline of how to read the data
    config_values = createConfig(can_id_values, dbc_decoded)
    # turn data from CAN messages -> list
    data_values_json = parse_data(mf4_file, config_values)

    context_data = json.loads(context_data)
    
    create_db_connection()["files"]
    if runOrderNumber == None:
        runOrderNumber=0
    context_data["event"]["runs"][0]["mf4File"]=fs.put(mf4_file, encoding="utf-8")
    context_data["event"]["runs"][0]["dbcFile"]=fs.put(dbc_file, encoding="utf-8")
    context_data["event"]["runs"][0]["orderNumber"] = runOrderNumber

    return(upload_data_in_chunks(context_data, data_values_json))
    
    

## This function uploads the contents of the messages
# to the NRDB in chunks of ~16 mb. Max size of a document
# is just below 17 mb, but to save time in the upload process
# we don't try to get it exact since each file could be > 160_000
# entries long
#
# @param collection_access_event reference to the mongo db connection
# @param data_values_json data to add to the db
def upload_data_in_chunks(new_run_data, data_values_json):
    # divide the data into chunks that are less the 16 mb
    # 150_000 ~< 15 mb but always < 16 mb
    sliced_data = list(sliced(data_values_json, 150_000))
    
    collection_access_messages = create_db_connection()["messages"]
    for data_index in range(0, len(sliced_data)):
        if "_id" in new_run_data:
            del new_run_data["_id"]
        data_upload = new_run_data
        data_upload ["event"]["uploadSection"] = data_index
        data_upload ["event"]["runs"][0]["messages"] = []
       
        #update progress of upload bar
        uploading_data_progress[0]=data_index/(len(sliced_data))
        data = sliced_data[data_index]
        # add data until it exceeds 16 mb
        # even at 10_000 additions per cycle the data will not get too big 
        while len(json.dumps(data).encode('utf-8')) < 16_000_000 and data_index+1 != len(sliced_data) and  len(sliced_data[data_index+1]) !=0:
            for _ in range(0, 10_000):
                if len(sliced_data[data_index+1]) ==0:
                    break
                data.append(sliced_data[data_index+1].pop())
        data_upload["event"]["runs"][0]["messages"] = data
        # add data to its own document and get the reference id number 
        collection_access_messages.insert_one(data_upload)
        
    uploading_data_progress[0]=1
    return 0


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


## The function that converts partial bits into an int
#
# @param number raw binary number to read
# @param starting_bit bit to start reading from
# @param final_bit bit to finish reading exclusive
# @return binary string of bits
def read_bits(number, starting_bit, final_bit):
    binary_number = format(number, "08b")
    binary_string = binary_number[starting_bit:final_bit]
    return binary_string


## The function that combines bytes of data
#
# @param numbers list of bytes to combine
# @return binary string of bytes
def combine_binary(*numbers):
    # Convert each number to an 8-bit binary string
    binary_list = [format(num, "08b") for num in numbers]

    # Reverse the order to combine from right to left
    binary_list.reverse()

    # Join the binary strings together
    combined_binary = "".join(binary_list)

    return combined_binary


## The function that looks at the signage of a number
#
# @param x number
# @param size number of bits
# @return signed in
def signed_bin_convert(x, size):
    return (x & ((1 << size - 1) - 1)) - (x & (1 << size - 1))


## The function that converts data from CAN to a list
#
# @param dbc_path the path to the dbc file for the CAN data
# @param mdf_path the path to the mf4 file
#
# @return list form of CAN data
def parse_data(mdf_path, config_values):
    # Load the MDF file
    mdf = MDF(mdf_path, memory_map=False)

    # Convert to a Pandas DataFrame
    df = mdf.to_dataframe()

    # Display the DataFrame
    values = df.values.tolist()
    timestamps = df.index.tolist()
    json_data = []
    
    for index in range(0, len(df.index)):

        can_id = values[index][1]
        if hex(can_id) not in config_values:
            continue

        config_data = config_values[hex(can_id)]
        
        data_array = values[index][5]

        # save the number of bytes/array indexes used by previous can messages to know where next ones begin
        # also save the number of bits used of the current byte if a message needs bits
        previous_bytes_used = 0
        previous_bits_used = 0
        
        config_data_length = len(config_data)
         
        for config_current_index in range(0, config_data_length ):

            config_current = config_data[config_current_index]

            # get the number of bits for the current data
            data_length_bits = config_current["size"]

            # lets manipulate some data!
            # each entry in the data array is 1 byte / 8  bits of data
            # if there are more than one byte of data associated with a message,
            # the second byte comes first in binary
            # data_array comes in as a ndarray with 1 dimension

            if data_length_bits % 8 == 0:

                # get the length in bytes of the needed data

                number_of_needed_bytes = data_length_bits // 8
                data_list = data_array.tolist()

                current_data_list = []

                for data_index in range(
                    previous_bytes_used, previous_bytes_used + number_of_needed_bytes
                ):
                    current_data_list.append(data_list[data_index])

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

                raw_result = read_bits(
                    data_list[previous_bytes_used],
                    previous_bits_used,
                    previous_bits_used + data_length_bits,
                )

                decimal_result = int(raw_result, 2)

                # increment the previous bits for teh next time time
                # also update bytes as needed. Some messages use both bits and bytes of data
                previous_bits_used += data_length_bits
                if previous_bits_used == 8:
                    previous_bytes_used += 1
                    previous_bits_used = 0

            table_name = config_current["table"]
            if table_name.find("ErrorRegister") != -1 or table_name.find("Manufacturer") != -1:
                continue
            json_object = {
                "time": timestamps[index],
                "signal": table_name,
                "canID": hex(can_id),
                "data": decimal_result,
                "size": data_length_bits,
            }

            # if there is an axis present save it as its own field
            if "axis" in config_current:
                json_object["axis"] = config_current["axis"]
            if "cellId" in config_current:
                json_object["cellId"] = config_current["cellId"]
            if "packId" in config_current:
                json_object["packId"] = config_current["packId"]
            if "thermId" in config_current:
                json_object["thermId"] = config_current["thermId"]
            parsing_data_progress[0] = config_current_index/config_data_length
            json_data.append(json_object)

    mdf.close()
    parsing_data_progress[0]=1
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


## The function that handles the imu board messages
#
# @param signal information about the CAN message
#
# @return data entry
def handle_imu(signal):
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


## The function that handle the pvc board messages
#
# @param signal information about the CAN message
#
# @return data entry
def handle_pvc(signal):

    signal_name = signal.name
    signal_to_table = {"State": "PvcState"}

    if signal_name in signal_to_table:
        signal_name = signal_to_table[signal_name]

    return {
        "table": signal_name,
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
            msg_config = []
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
                    case _:
                        entry = {
                            "table": signal.name,
                            "size": signal.length,
                            "signage": "signed" if signal.is_signed else "unsigned",
                        }

                if entry != None:
                    msg_config.append(entry)

        config[hex(msg.frame_id)] = msg_config

    # return the config dictionary,
    return config


## The function that makes the progress of data upload visible to the frontend
#
# @return dictionary with the current state the process is on and its percentage
def get_progress():
    
    if parsing_data_progress[0]!=1:
       return {"Parsing Data": parsing_data_progress[0]}
    elif uploading_data_progress[0]!=1:
       return {"uploading data": uploading_data_progress[0]}
    
    parsing_data_progress[0]=0
    uploading_data_progress[0]=0
    
    return {"Finished": None}
