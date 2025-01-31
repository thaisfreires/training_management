from sqlite3 import Connection
import psycopg2

conn = psycopg2.connect(database='rh_db', user='citizix_user', password='S3cret', host='localhost', port=5432)

cursor= conn.cursor()

cursor.execute("select version()")

data= cursor.fetchone()
print("Connection established to: ", data)

conn.close()
