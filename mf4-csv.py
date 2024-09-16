from asammdf import MDF
import re
import psycopg2
import dotenv
import json
import os
import utils

configFilePath = "boardConfig.json"
expectedIdIndex = 0

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
    dotenv.load_dotenv("./credentials.env")
    file_convert(1)


# Converts .mf4 files to .csv files. There are 7 channel groups created in this conversion. We currently only use number 7.
# This fact will be hard coded into this process as I do not forsee a world where our Mech-E team ever uses another channel.
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
        print("You fool; thats not a valid file! The file must be a .mf4")
    handle_data(files)


#Streams data into the DB 
def handle_data(files):
    for file in files:
        with open(file) as open_file:
            for line in open_file:
                canMessageArr = line.split(',')
                formattedArray = format_data_bytes(canMessageArr[6])
                #Currently hard coding the contextId input because there is only one (dummy) contextId
                sql = "INSERT into canmessage (ID, busId, frameId, dataBytes, receiveTime, contextId) VALUES (DEFAULT, %s, %s, %s, %s, 1)"
                utils.exec_commit(sql, (canMessageArr[1], canMessageArr[2], formattedArray, canMessageArr[0]))


def format_data_bytes(bytes):
    #Match and replace all characters until the first digit
    exposedDigit = re.sub('^[\[\s]*', "", bytes)
    #Replace all spaces with commas
    spaceless = re.sub('\s+', ',', exposedDigit)
    #Add the {
    openBracket = "{" + spaceless
    #Replace all ] with } (Should only be one)
    closeBracket = re.sub('\]+', '}', openBracket)
    return(closeBracket)


if __name__ == '__main__':
    main()
