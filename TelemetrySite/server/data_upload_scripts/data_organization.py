from asammdf import MDF
import re
import os
from tqdm import tqdm
from utils import connect, exec_commit_many


"""@package docstring
This file converts .mf4 files to .csv files and then uploads them to the database
"""


##Converts .mf4 files to .csv files. There are 7 channel groups created in this conversion. We currently only use number 7.
# This fact will be hard coded into this process as I do not forsee a world where our Mech-E team ever uses another channel.
def file_convert(file, config_id):

    file = file.lower()
    files = []
    if bool(re.search(".mf4$", file)):
        mdf = MDF(file)
        file = file.strip(".mf4")
        mdf.export(fmt="csv", filename=file + ".csv")
        # This is the location of the hard coding of the files we care about. To change this remove the line below and uncomment the for loop.
        # files.append(file+'.ChannelGroup_' + str(7) + '.csv')
        for x in range(0, 9):
            files.append(file + ".ChannelGroup_" + str(x) + ".csv")
            with open(file + ".ChannelGroup_" + str(x) + ".csv") as f:
                first_line = f.readline()
    else:
        print("You fool; thats not a valid file! The file must be an mf4")
    handle_data(files, config_id)


## Streams data into the DB
#
# @param files The paths to the array of files being processed
def handle_data(files, config_id):

    conn = connect()
    cur = conn.cursor()
    for file in files:
        dataToExecuteMany = []
        num_lines = 0
        with open(file) as f:
            num_lines = sum(1 for _ in f)

        with open(file) as open_file:
            # Used to skip the first line of the file which is string values to indicate the values in the can message
            firstLine = open_file.readline()
            counter = 0
            num_lines -= 1
            # Creates the loading bar. Value displayed represents the number of lines handled
            for line in tqdm(open_file):
                counter += 1
                canMessageArr = line.split(",")
                formattedArray = format_data_bytes(canMessageArr[6])
                dataToExecuteMany.append(
                    (
                        canMessageArr[1],
                        canMessageArr[2],
                        formattedArray,
                        canMessageArr[0],
                        config_id,
                    )
                )
                # update progress of the file upload
                if counter % 1000 == 0:

                    sql = "INSERT into canmessage (ID, busId, frameId, dataBytes, receiveTime, contextId) VALUES (DEFAULT, %s, %s, %s, %s, %s)"
                    try:
                        exec_commit_many(sql, dataToExecuteMany)
                        dataToExecuteMany = []
                    except TimeoutError:
                        print(len(dataToExecuteMany))
            sql = "INSERT into canmessage (ID, busId, frameId, dataBytes, receiveTime, contextId) VALUES (DEFAULT, %s, %s, %s, %s, %s)"
            try:
                cur.executemany(sql, dataToExecuteMany)
            except TimeoutError:
                print(len(dataToExecuteMany))

    conn.commit()
    conn.close()
    # remove csv files from folder
    for file in files:
        os.remove(file)


## Formats the data bytes into a format the DB can handle as an array
#
# @param bytes the data bytes as a text string similar to [  6   0   0   0  32 161   7   0]
def format_data_bytes(bytes):
    # Sample data before regex: [  6   0   0   0  32 161   7   0]
    # Match and replace all characters until the first digit
    exposedDigit = re.sub("^[\[\s]*", "", bytes)
    # Replace all spaces with commas
    spaceless = re.sub("\s+", ",", exposedDigit)
    # Add the '{'
    openBracket = "{" + spaceless
    # Replace all ']' with '}' (Should only be one)
    closeBracket = re.sub("\]+", "}", openBracket)
    # Sample data after regex: {6,0,0,0,32,161,7,0}
    return closeBracket
