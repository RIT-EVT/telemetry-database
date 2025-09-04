import asammdf
import cantools
import json

dbc_file="./TestFiles/DEV1_4_13.dbc"
mf4_file = "./TestFiles/ExampleData.mf4"

# This is an example of how your file to parse data from mf4/dbc to json could look like
# You are of course welcome to change this anyway you see fit, so long as it works

def parse_data():
    # Add any code for parsing data from the m4f file
    return 0

def decode_dbc():
    # Add any code for decoding the DBC file.
    # Or do this elsewhere, I won't tell you how to code
    return 0

with open("TestData.json", "w") as json_file:
    # Save values to a json file here
    data_values_json={}
    json.dump(data_values_json, json_file, indent=4)