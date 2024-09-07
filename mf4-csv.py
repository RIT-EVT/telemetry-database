from asammdf import MDF
import re
import psycopg2
import dotenv
import json
import os

configFilePath = "boardConfig.json"

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
    "20" : "BMS1A",
    "21" : "BMS1B",
    "22" : "BMS2A",
    "23" : "BMS2B",
    "24" : "BMS3A",
    "25" : "BMS3B",
    "30" : "BMS1AV",
    "31" : "BMS1BV",
    "32" : "BMS2AV",
    "33" : "BMS2BV",
    "34" : "BMS3AV",
    "35" : "BMS3BV",
}

def main():
    dotenv.load_dotenv()
    conn = psycopg2.connect(
        database="postgres", user=os.getenv("USER"), password=os.getenv("PASSWORD"), host=os.getenv("HOST"), port=os.getenv("PORT")   
    )
    cursor = conn.cursor()

    data = cursor.execute("""
    SELECT * from PVCSTATE
    """)
    print(data)
    #file_convert()



"""Converts .mf4 files to .csv files. There are 7 channel groups created in this conversion. We currently only use number 7.
This fact will be hard coded into this process as I do not forsee a world where our Mech-E team ever uses another channel."""
def file_convert():
    print("MF4 file path:")
    file = input().lower()
    files = []
    if(bool(re.search(".mf4$", file))):
        mdf = MDF(file)
        file = file.strip(".mf4")
        mdf.export(fmt='csv', filename= file+'.csv')
        #This is the location of the hard coding of the files we care about. To change this remove the line below and uncomment the for loop.
        files.append(file+'.ChannelGroup_' + str(7) + '.csv')
        # for x in range (0, 8): 
        #     files.append(file+'.ChannelGroup_' + str(x) + '.csv')
        #     with open(file+'.ChannelGroup_' + str(x) + '.csv') as f:
        #         first_line = f.readline()
    else:
        print("You fool; thats not a valid file! The file must be an .mf4")
    handle_data(files)

def handle_data(files):
    for file in files:
        with open(file) as open_file:
            first_line = open_file.readline()
            first_line_listed = first_line.split(",")
            status = "CAN_DataFrame.CAN_DataFrame.ID" in first_line_listed
            dataLengthIndex = first_line_listed.index("CAN_DataFrame.CAN_DataFrame.DataLength")
            dataBytesIndex = first_line_listed.index("CAN_DataFrame.CAN_DataFrame.DataBytes")
            idIndex = first_line_listed.index("CAN_DataFrame.CAN_DataFrame.ID")
            counter = 0
            for line in open_file:
                counter += 1
                if(status):
                    outboard, cob_id = determine_board_owner(line, idIndex)
                    extract_data_bytes(outboard, cob_id, dataLengthIndex, dataBytesIndex)





def determine_board_owner(line, index):
    listed_line = line.split(",")
    id = int(listed_line[index])
    """Values based on the CAN Open standard. Each hex value relates to a TPDO message"""
    if(id < tpdoDictionary["TPDO0"]):
        return("Unknown COBID", 0)
    if(id <= tpdoDictionary["DEADZONE_1"]):
        default_COB_ID = tpdoDictionary["TPDO0"]
    elif(id <= tpdoDictionary["TPDO1"]):
        return("Unknown COBID", tpdoDictionary["DEADZONE_1"])
    elif(id <= tpdoDictionary["DEADZONE_2"]):
        default_COB_ID = tpdoDictionary["TPDO1"]
    elif(id <= tpdoDictionary["TPDO1"]):
        return("Unknown COBID", tpdoDictionary["DEADZONE_2"])
    elif(id <= tpdoDictionary["DEADZONE_3"]):
        default_COB_ID = tpdoDictionary["TPDO2"]
    elif(id <= tpdoDictionary["TPDO3"]):
        return("Unknown COBID", tpdoDictionary["DEADZONE_3"])
    elif(id <= tpdoDictionary["DEADZONE_4"]):
        default_COB_ID = tpdoDictionary["TPDO3"]
    else:
        return("Unknown COBID", tpdoDictionary["DEADZONE_4"])
    return(nodeIDDictionary[str(id-default_COB_ID)], default_COB_ID)

    
def extract_data_bytes(outboard, cob_id, dataLengthIndex, dataBytesIndex):
    config_file = open(configFilePath)
    config = json.load(config_file)
    print(config[outboard][hex(cob_id)])

if __name__ == '__main__':
    main()
