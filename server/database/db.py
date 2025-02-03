import csv
import uuid
from sqlalchemy import create_engine
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine=create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SQLAlchemy()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

