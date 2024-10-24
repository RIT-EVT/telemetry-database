import psycopg2
import os


## Use to connect to the database using the .env file
def connect():
    return psycopg2.connect(
        database="bert",
        user=os.getenv("DB_USER"),
        password=os.getenv("PASSWORD"),
        host=os.getenv("HOST"),
        port=os.getenv("PORT"),
    )


## Executes all SQL commands in the file at the provided path
#
# @param path The path to the SQL file being executed
def exec_sql_file(path):
    full_path = os.path.join(os.path.dirname(__file__), f"{path}")
    conn = connect()
    cur = conn.cursor()
    with open(full_path, "r") as file:
        cur.execute(file.read())
    conn.commit()
    conn.close()


## Use this to SELECT the top entry from the DB
#
# @param sql The sql command to be executed as a string. Any args should be given a "%s" and provided in the args
# @param args A tuple which holds the args to be injected into the SQL string. Single args should be written as (arg,)
def exec_get_one(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    one = cur.fetchone()
    conn.close()
    return one


def exec_commit_many(sql, args):
    conn = connect()
    cur = conn.cursor()
    result = cur.executemany(sql, args)
    conn.commit()
    conn.close()
    return result


## Use this to SELECT all entries from the database which match the select criteria
#
# @param sql The sql command to be executed as a string. Any args should be given a "%s" and provided in the args
# @param args A tuple which holds the args to be injected into the SQL string. Single args should be written as (arg,)
def exec_get_all(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    cur.execute(sql, args)
    list_of_tuples = cur.fetchall()
    conn.close()
    return list_of_tuples


## Use this to INSERT an entry into the database
#
# @param sql The sql command to be executed as a string. Any args should be given a "%s" and provided in the args
# @param args A tuple which holds the args to be injected into the SQL string. Single args should be written as (arg,)
def exec_commit(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    conn.commit()
    conn.close()
    return result


## Returns ID of whatever was committed
#
# @param sql The sql command to be executed as a string. Any args should be given a "%s" and provided in the args
# @param args A tuple which holds the args to be injected into the SQL string. Single args should be written as (arg,)
def exec_commit_with_id(sql, args={}):
    conn = connect()
    cur = conn.cursor()
    result = cur.execute(sql, args)
    # To get any returning items, must do a fetchall
    result = cur.fetchall()
    conn.commit()
    conn.close()
    return result
