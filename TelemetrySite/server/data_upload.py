from asammdf import MDF
import re
import psycopg2
import dotenv
import json
import os
from tqdm import tqdm
import utils

"""@package docstring
This file converts .mf4 files to .csv files and then uploads them to the database
"""
configFilePath = "boardConfig.json"
expectedIdIndex =  69

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


##Converts .mf4 files to .csv files. There are 7 channel groups created in this conversion. We currently only use number 7.
#This fact will be hard coded into this process as I do not forsee a world where our Mech-E team ever uses another channel.
def file_convert():
    print("MF4 file path:")
    file = input().lower()
    files = []
    if(bool(re.search(".mf4$", file))):
        mdf = MDF(file)
        file = file.strip(".mf4")
        mdf.export(fmt='csv', filename= file+'.csv')
        # This is the location of the hard coding of the files we care about. To change this remove the line below and uncomment the for loop.
        # files.append(file+'.ChannelGroup_' + str(7) + '.csv')
        for x in range (0, 8): 
            files.append(file+'.ChannelGroup_' + str(x) + '.csv')
    else:
        print("You fool; thats not a valid file! The file must be an mf4")
    handle_data(files)


## Streams data into the DB 
#
# @param files The paths to the array of files being processed
def handle_data(files):
    conn = utils.connect()
    cur = conn.cursor()
    for file in files:
        dataToExecuteMany = []
        with open(file) as open_file:
            row_count = sum(1 for row in open_file)
        open_file.close()
        with open(file) as open_file:
            # Used to skip the first line of the file which is string values to indicate the values in the can message
            firstLine = open_file.readline()
            if(row_count > 2):
                sql = "INSERT into canmessage (ID, busId, frameId, dataBytes, receiveTime, contextId) VALUES (DEFAULT, %s, %s, %s, %s, %s)"
                # Creates the loading bar. Value displayed represents the number of lines handled
                for lineNum in tqdm(range(1, row_count), ncols= 80):
                    canMessageArr = open_file.readline().split(',')
                    dataToExecuteMany.append((canMessageArr[1], canMessageArr[2], format_data_bytes(canMessageArr[6]), canMessageArr[0], expectedIdIndex))
                    # Currently hard coding the contextId input because there is only one (dummy) contextId
                    if(lineNum % 1000 == 0):
                        # try:
                        cur.executemany(sql, dataToExecuteMany)
                        dataToExecuteMany = []
                        # except:
                        #     print(len(dataToExecuteMany))
                try:
                    cur.executemany(sql, dataToExecuteMany)
                except:
                    print(len(dataToExecuteMany))
    conn.commit()
    conn.close()


## Formats the data bytes into a format the DB can handle as an array
#
# @param bytes the data bytes as a text string similar to [  6   0   0   0  32 161   7   0]
def format_data_bytes(bytes):
    # Sample data before regex: [  6   0   0   0  32 161   7   0]
    # Match and replace all characters until the first digit
    exposedDigit = re.sub('^[\[\s]*', "", bytes)
    # Replace all spaces with commas
    spaceless = re.sub('\s+', ',', exposedDigit)
    # Add the '{'
    openBracket = "{" + spaceless
    # Replace all ']' with '}' (Should only be one)
    closeBracket = re.sub('\]+', '}', openBracket)
    # Sample data after regex: {6,0,0,0,32,161,7,0}
    return(closeBracket)


## Main function to complete file conversion
def main():
    dotenv.load_dotenv("./credentials.env")
    file_convert()

if __name__ == '__main__':
    main()
