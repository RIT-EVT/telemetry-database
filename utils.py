import psycopg2
import os

def connect():
    return psycopg2.connect("bert", 
                            os.getenv("DB_USER"), 
                            os.getenv("PASSWORD"), 
                            os.getenv("HOST"), 
                            os.getenv("PORT") )

# Executes all SQL commands in the file at the provided path
def exec_sql_file(path):
    full_path = os.path.join(os.path.dirname(__file__), f'{path}')
    conn = connect()
    cur = conn.cursor()
    with open(full_path, 'r') as file:
        cur.execute(file.read())
    conn.commit()
    conn.close()

# Use this to SELECT the top entry from the DB
# Provide the SQL string and the arguments as a tuple, '(var1,)' for one arg
def exec_get_one(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    one = cur.fetchone()
    conn.close()
    return one

# Use this to SELECT all entries from the database which match the select criteria
# Provide the SQL string and the arguments as a tuple, '(var1,)' for one arg
def exec_get_all(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    list_of_tuples = cur.fetchall()
    conn.close()
    return list_of_tuples

# Use this to INSERT an entry into the database
# Provide the SQL string and the arguments as a tuple, '(var1,)' for one arg
def exec_commit(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    conn.commit()
    conn.close()
    return result

# Returns ID of whatever was committed
# Usage: 'INSERT INTO myTable (col1, col2) VALUES (%s,%s)  RETURNING id'
def exec_commit_with_id(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    #To get any returning items, must do a fetchall
    result = cur.fetchall()
    conn.commit()
    conn.close()
    return result

