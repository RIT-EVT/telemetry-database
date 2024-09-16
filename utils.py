import psycopg2
import os

def connect():
    return psycopg2.connect(database="bert", 
                            user=os.getenv("DB_USER"), 
                            password=os.getenv("PASSWORD"), 
                            host=os.getenv("HOST"), 
                            port=os.getenv("PORT") )

def exec_sql_file(path):
    full_path = os.path.join(os.path.dirname(__file__), f'{path}')
    conn = connect()
    cur = conn.cursor()
    with open(full_path, 'r') as file:
        cur.execute(file.read())
    conn.commit()
    conn.close()

def exec_get_one(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    one = cur.fetchone()
    conn.close()
    return one

def exec_get_all(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    # https://www.psycopg.org/docs/cursor.html#cursor.fetchall
    list_of_tuples = cur.fetchall()
    conn.close()
    return list_of_tuples

def exec_commit(sql, args={}):
    #print("exec_commit:\n" + sql+"\n")
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

