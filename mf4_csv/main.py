
import os 
from asammdf import MDF, Signal
from os import walk
import re
import glob


output_dir = "./output_in_csv"

def prepare_dir(mf4_file):
    my_str = str(mf4_file)
    my_str = my_str.lower().strip(".mf4")
    my_str = my_str.replace(".MF4", ".csv")
    # chars = "./-\"
    # for c in chars:
    #     text = text.replace(c, "\\" + c)
    rx = re.compile('([-./\ ])')
    my_str = rx.sub('_', my_str)
    # print(my_str)
    return my_str

   

def convertMF4toCSV(mf4_file):
    data = MDF(mf4_file)
    # f_out = f_in.replace(".MF4", ".csv") 
    # mdf = MDF(f_in) #read mf4 data 

    # d_dir = prepare_dir(mf4_file)
    # print(d_dir)
    f_out = mf4_file.replace(".MF4", ".csv")
    data.export(fmt='csv', filename=f_out) #write to csv 
    print("{} group completed".format(f_out))


for root, dirs, files in os.walk("./"):
    for filename in files:
        # doSomethingWithFile(os.path.join(root, filename))
        # if glob.glob(os.path.join(root, filename)+"/*.MF4"):        
        ext = ["MF4", "mf4"];
        if filename.endswith(ext[0], filename.index("."), len(filename)) or filename.endswith(ext[1], filename.index("."), len(filename)):
            # print(os.path.join(root, filename))
            convertMF4toCSV(os.path.join(root, filename))

        
print("All file converted!")
    # for dirname in dirs:
    #     # doSomewthingWithDir(os.path.join(root, dirname))
    #     print(os.path.join(root, dirname))


