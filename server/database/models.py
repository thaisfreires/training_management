import csv
import os
import uuid
from requests import session
from sqlalchemy import Column, String, UUID, Integer, Float, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from .db import get_db

Base = declarative_base()
db=get_db
 
class Area(Base):
    __tablename__ = "area"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)

    courses = relationship("Courses", back_populates="area")

    def to_dict(self):
        return{
            "id": self.id, 
            "name": self.name
        }

class Entity(Base):
    __tablename__ = "entity"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)

    courses = relationship("Courses", back_populates="entity")

    def to_dict(self):
        return{
            "id": self.id, 
            "name": self.name
        }
class Location(Base):
    __tablename__ = "location"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)

    courses = relationship("Courses", back_populates="location")

    def to_dict(self):
        return{
            "id": self.id, 
            "name": self.name
        }

class Courses(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    area_id = Column(UUID, ForeignKey("area.id"), nullable=False)
    description = Column(Text, nullable=False)
    entity_id = Column(UUID, ForeignKey("entity.id"), nullable=True)
    duration = Column(Integer, nullable=False)
    location_id = Column(UUID, ForeignKey("location.id"), nullable=True)
    price = Column(Float, nullable=True)

    area = relationship("Area", back_populates="courses")
    entity = relationship("Entity", back_populates="courses")
    location = relationship("Location", back_populates="courses")

    def to_dict(self):
        return{
            "id": self.id, 
            "name": self.name, 
            "description": self.description,
            "duration": self.duration,
            "price": self.price,
            "area": 
            {
                "id": self.area.id, 
                "name": self.area.name
            },
            "entity":
            {
                "id": self.entity.id, 
                "name": self.entity.name
            },
            "location":
            {
                "id": self.location.id, 
                "name": self.location.name
            }
        }
def create_entity(db, data):
    try:
        entity = db.query(Entity).filter_by(name=data.get('name')).first()

        if entity:
            raise ValueError('Entity already exists')

        data['id'] = data.get('id') or str(uuid.uuid4())

        new_entity = Entity(
            id= data['id'],
            name = data.get('name'),
        )

        db.add(new_entity)
        db.commit()
        return new_entity.to_dict()
    
    except Exception as e:
        print(e)
        db.rollback()
        raise ValueError(f"Error creating entity: {str(e)}")
    
def create_course(db, data):
    try:
        data['id'] = data.get('id') or str(uuid.uuid4())

        new_course = Courses(
            id=data['id'],
            name=data['name'],
            area_id=data.get('area_id'),
            description=data['description'],
            entity_id=data.get('entity_id'),
            duration=data['duration'],
            location_id=data.get('location_id'),
            price=data['price']
            )
        db.add(new_course)
        db.commit()

        return new_course.to_dict()
    
    except Exception as e:
        print(e)
        db.rollback()
        raise ValueError(f"Error creating course: {str(e)}")

def update_course(db, data):
    try:
        course = db.query(Courses).filter_by(id=data.get('id')).first()

        if course:
            course.id = data.get('id'),
            course.name = data.get('name'),
            course.area_id = data.get('area_id'),
            course.description = data.get('description'),
            course.entity_id = data.get('entity_id'),
            course.duration = data.get('duration'),
            course.location_id = data.get('location_id'),
            course.price = data.get('price')
                
            db.commit()
            return course.to_dict()
    
    except Exception as e:
        print(e)
        db.rollback()
        raise ValueError(f"Error creating course: {str(e)}")

def create_area(db,data):
    try:
        area = db.query(Area).filter_by(name=data.get('name')).first()

        if area:
            raise ValueError('Area already exists')

        new_id = data.get('id') or str(uuid.uuid4())
        data['id'] = new_id

        new_area = Area(
            id= new_id,
            name = data.get('name'),
        )

        db.add(new_area)
        db.commit()
        return new_area.to_dict()
    
    except Exception as e:
        print(e)
        db.rollback()
        raise ValueError(f"Error creating entity: {str(e)}")   

def create_location(db,data):
    try:
        location = db.query(Location).filter_by(name=data.get('name')).first()

        if location:
            raise ValueError('Area already exists')

        new_id = data.get('id') or str(uuid.uuid4())
        data['id'] = new_id

        new_location = Location(
            id= new_id,
            name = data.get('name'),
        )

        db.add(new_location)
        db.commit()
        return new_location.to_dict()
    
    except Exception as e:
        print(e)
        db.rollback()
        raise ValueError(f"Error creating entity: {str(e)}")   

def populate_area():
    data = [
        {"id": str(uuid.uuid4()), "name": "Marketing"},
        {"id": str(uuid.uuid4()), "name": "IT"},
        {"id": str(uuid.uuid4()), "name": "Sales"},
        {"id": str(uuid.uuid4()), "name": "Legal"},
        {"id": str(uuid.uuid4()), "name": "Procurement"},
        {"id": str(uuid.uuid4()), "name": "R&D"},
        {"id": str(uuid.uuid4()), "name": "Operations"},
        {"id": str(uuid.uuid4()), "name": "Customer Service"},
        {"id": str(uuid.uuid4()), "name": "Finance"},
        {"id": str(uuid.uuid4()), "name": "HR"}
    ]

    with next(get_db()) as db:
        for item in data:
            area = Area(**item)
            db.add(area)
        db.commit()
        print("Area added successfully.")

def populate_location():
    data = [
        {"id": uuid.uuid4(), "name": "Porto"},
        {"id": uuid.uuid4(), "name": "Online"},
        {"id": uuid.uuid4(), "name": "Lisbon"},
        {"id": uuid.uuid4(), "name": "Coimbra"}
    ]

    with next(get_db()) as db:
        for item in data:
            location = Location(**item)
            db.add(location)
        db.commit()
        print("Location successfully added.")

def populate_entity():
    data = [
        {"id": uuid.uuid4(), "name": "Iscte - Instituto Universitário de Lisboa "},
        {"id": uuid.uuid4(), "name": "Udemy"},
        {"id": uuid.uuid4(), "name": "Instituto do Emprego e Formação Profissional - IEFP"}
    ]

    with next(get_db()) as db:
        for item in data:
            entity = Entity(**item)
            db.add(entity)
        db.commit()
        print("Entity table successfully populated")


# populate_entity()
# populate_location()
# populate_area()    