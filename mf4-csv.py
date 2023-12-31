from asammdf import MDF
import re


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
    file_convert()

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
        #This is the location of the hard coding of the files we care about. To change this remove the line below and uncomment the one in the for loop.
        files.append(file+'.ChannelGroup_' + str(7) + '.csv')
        for x in range (0, 8): 
            #files.append(file+'.ChannelGroup_' + str(x) + '.csv')
            with open(file+'.ChannelGroup_' + str(x) + '.csv') as f:
                first_line = f.readline()
    else:
        print("You fool; thats not a valid file! The file must be a .mf4")
    handle_data(files)

def handle_data(files):
    for file in files:
        with open(file) as open_file:
            first_line = open_file.readline()
            first_line_listed = first_line.split(",")
            status = "CAN_DataFrame.CAN_DataFrame.ID" in first_line_listed
            counter = 0
            for line in open_file:
                counter += 1
                if(status):
                    outboard, COB_ID = determine_board_owner(line, first_line_listed.index("CAN_DataFrame.CAN_DataFrame.ID"))





def determine_board_owner(line, index):
    listed_line = line.split(",")
    id = int(listed_line[index])
    if(id < 0x180):
        return("Unknown COBID")
    if(id <= 0x200):
        default_COB_ID = 0x180
    elif(id <= 0x280):
        default_COB_ID = 0x200
    elif(id <= 0x300):
        default_COB_ID = 0x280
    elif(id <= 0x380):
        default_COB_ID = 0x300
    elif(id <= 0x400):
        default_COB_ID = 0x380
    elif(id <= 0x480):
        default_COB_ID = 0x400
    elif(id <= 0x500):
        default_COB_ID = 0x480
    elif(id <= 0x580):
        default_COB_ID = 0x600
    else:
        return("Unknown COBID")
    return(nodeIDDictionary[str(id-default_COB_ID)], default_COB_ID)

    


if __name__ == '__main__':
    main()
