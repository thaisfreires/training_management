from sqlite3 import Connection
import psycopg2
from dotenv import load_dotenv
import os
load_dotenv()

conn = psycopg2.connect(database=os.getenv("POSTGRES_DB"), user=os.getenv("POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"), host=os.getenv("POSTGRES_HOST"), port=os.getenv("POSTGRES_PORT"))

cursor= conn.cursor()

cursor.execute("select version()")

data= cursor.fetchone()
print("Connection established to: ", data)

conn.close()
