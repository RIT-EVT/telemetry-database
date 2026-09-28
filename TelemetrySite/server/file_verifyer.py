from asammdf import MDF
import cantools
from data_upload_scripts.data_upload import get_board_names, create_config, parse_data

MF4 = "./tests/test_data/ExampleData.MF4.test"
DBC = "./tests/test_data/DEV1_4_13.dbc.test"


dbc = cantools.database.load_file(DBC, database_format="dbc")
ids = get_board_names(dbc)
config = create_config(ids, dbc)

rows, signals = parse_data(MF4, config, ids)
print("rows:", len(rows))
print("signals:", sorted(signals)[:20])
print("sample:", rows[:2])
