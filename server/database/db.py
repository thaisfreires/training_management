import csv
import os
import uuid
from sqlalchemy import create_engine
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URI = "postgresql+psycopg2://citizix_user:S3cret@localhost:5432/rh_db"

engine=create_engine(SQLALCHEMY_DATABASE_URI)
SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SQLAlchemy()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

