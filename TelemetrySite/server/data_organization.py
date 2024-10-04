import psycopg2
import dotenv
import json
import os
import utils
from psycopg2.sql import Identifier, SQL

contextId = 1
configFilePath = "TelemetrySite/server/boardConfig.json"

UNKNOWN_COB_STRING = "Unknown COBID"

BMSX_0_TYPE_CONFIG = "BMSX_0"

BMSX_1_TYPE_CONFIG = "BMSX_1"

tpdoDictionary = {
    "TPDO0"     : 0x180,
    "DEADZONE_1": 0x200,
    "TPDO1"     : 0x280,
    "DEADZONE_2": 0x300,
    "TPDO2"     : 0x380,
    "DEADZONE_3": 0x400,
    "TPDO3"     : 0x480,
    "DEADZONE_4": 0x500,
    "MAX_VAL"   : 0x580 
}

nodeIDDictionary = {
    "1" : "Motor Controller",
    "7" : "TMU",
    "8" : "TMS",
    "9" : "IMU",
    "10" : "PVC",
    "11" : "HUDL",
    "12" : "TPMS",
    "13" : "APM",
    "16" : "Charge Controller",
    "20" : "BMS0_0",
    "21" : "BMS1_0",
    "22" : "BMS2_0",
    "23" : "BMS3_0",
    "24" : "BMS4_0",
    "25" : "BMS5_0",
    "30" : "BMS0_1",
    "31" : "BMS1_1",
    "32" : "BMS2_1",
    "33" : "BMS3_1",
    "34" : "BMS4_1",
    "35" : "BMS5_1",
}


def determine_board_owner_and_cob(id):
    """Values based on the CAN Open standard. Each hex value relates to a TPDO message"""
    if(id < tpdoDictionary["TPDO0"]):
        return(UNKNOWN_COB_STRING, 0)
    if(id <= tpdoDictionary["DEADZONE_1"]):
        default_COB_ID = tpdoDictionary["TPDO0"]
    elif(id <= tpdoDictionary["TPDO1"]):
        return(UNKNOWN_COB_STRING, tpdoDictionary["DEADZONE_1"])
    elif(id <= tpdoDictionary["DEADZONE_2"]):
        default_COB_ID = tpdoDictionary["TPDO1"]
    elif(id <= tpdoDictionary["TPDO1"]):
        return(UNKNOWN_COB_STRING, tpdoDictionary["DEADZONE_2"])
    elif(id <= tpdoDictionary["DEADZONE_3"]):
        default_COB_ID = tpdoDictionary["TPDO2"]
    elif(id <= tpdoDictionary["TPDO3"]):
        return(UNKNOWN_COB_STRING, tpdoDictionary["DEADZONE_3"])
    elif(id <= tpdoDictionary["DEADZONE_4"]):
        default_COB_ID = tpdoDictionary["TPDO3"]
    else:
        return(UNKNOWN_COB_STRING, tpdoDictionary["DEADZONE_4"])
    return(nodeIDDictionary[str(id-default_COB_ID)], default_COB_ID)


def handle_data(can_data):
    with open(configFilePath) as configFile:
            config = json.load(configFile)
            for data_tuple in can_data:
                frameID     = data_tuple[2]
                dataBytes   = data_tuple[3]
                receiveTime = data_tuple[4]
                contextId   = data_tuple[5]
                board_owner, cob_id = determine_board_owner_and_cob(frameID)
                if(board_owner != UNKNOWN_COB_STRING and board_owner != "Motor Controller"):
                    if(board_owner[:3] != "BMS"):
                        tpdo_config = config[board_owner][hex(cob_id)]
                        upload_organized(tpdo_config, dataBytes, receiveTime, contextId)
                    else:
                        tpdo_config = handle_bms_config(config, board_owner, hex(cob_id))
                # insert_string = ""
                # value_strings = []
                # for value in tpdo_config:
                #     insert_string += ",%s "
                    


def upload_organized(tpdo_config, dataBytes, receiveTime, contextId):
    conn = utils.connect()
    cur = conn.cursor()
    binary_data_string = ""
    # Convert the bytes into a binary string (This makes it 8x biigger than before!)
    for data in dataBytes:
        binary_data_string = binary_data_string + bin(data)[2:].zfill(8)
    # Here we are extracting the information from the config file to figure out what our sql statement will look like
    for data_package in tpdo_config:
        insert_columns = []
        insert_string = ""
        column_string = ""
        data_insert_array = []
        table_to_insert = data_package["table"]
        data_size = data_package["size"]
        # Pop off the bits of size data_size from the front of binary_data_string
        binary_data_string, insert_data_string = extract_data_bytes_by_size(data_size, binary_data_string)
        insert_data_int = int(insert_data_string, 2)
        for index in data_package.keys():
            if(index != "table" and index != "size"):
                insert_string += "%s, "
                column_string += "{}, "
                insert_columns.append(index)
                data_insert_array += str(data_package[index])
        insert_string += "%s, %s, %s"
        column_string += "{}, {}, {}"
        insert_columns += ["val", "receiveTime", "contextId"]
        data_insert_array += [insert_data_int, str(receiveTime), contextId]
        finalized_sql_insert_string_tuple = data_insert_array
        format_array = [Identifier(table_to_insert.lower())]
        for value in insert_columns:
            format_array.append(Identifier(value.lower()))
        cur.execute(SQL("INSERT into {} (" + column_string + ")  VALUES (" + insert_string + ")").format(*format_array), (*finalized_sql_insert_string_tuple,))
    conn.commit()
    conn.close()
            
            
def extract_data_bytes_by_size(data_size, binary_data_string):
    data_string = binary_data_string[:data_size]
    binary_data_string = binary_data_string[data_size:]
    return binary_data_string, data_string

def handle_bms_config(config, board_owner, cob_id):
    try:
        if(board_owner[-1] == "1"):
            print(config[BMSX_1_TYPE_CONFIG])
            return config[BMSX_1_TYPE_CONFIG][cob_id]
        else:
            return config[BMSX_0_TYPE_CONFIG][cob_id]
    except(KeyError):
        print("WARNING KEY ERROR IN CONFIG Board: " + board_owner + " with COB_ID: " + cob_id)



def organize_can_from_db(contextId):
    sql = "SELECT id, busId, frameId, dataBytes, receiveTime, contextId FROM CANMESSAGE WHERE contextId = %s"
    can_data = utils.exec_get_all(sql, (contextId,))
    handle_data(can_data)


def main():
    dotenv.load_dotenv("./credentials.env")
    organize_can_from_db(contextId)


if __name__ == '__main__':
    main()