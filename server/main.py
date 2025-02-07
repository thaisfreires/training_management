import datetime
import mimetypes
import uuid
from flask import Flask, Response, logging, redirect, request, send_file, send_from_directory, jsonify
import os
from sqlalchemy import UUID
from sqlalchemy.orm import joinedload
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
from database import db
from database.db import SQLALCHEMY_DATABASE_URI, get_db
from database.models import Courses, Entity, Location, Area, create_area, create_course, create_entity, create_location, update_course
from scheduler import start_job, stop_job
from flask_swagger_ui import get_swaggerui_blueprint

app = Flask(__name__)
CORS(app, origins="*")

SWAGGER_URL = "/swagger"
API_URL = "/static/swagger.json"
swagger_ui_blueprint= get_swaggerui_blueprint(SWAGGER_URL, API_URL)
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

UPLOAD_FOLDER = os.path.join('.', 'PDF_generator')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
db = SQLAlchemy(app)

@app.route('/courses', methods=['GET', 'POST'])
def handle_courses():    
    print(app.config['SQLALCHEMY_DATABASE_URI'])
    if request.method == 'GET':
       return all_courses()
    if request.method == 'POST':
        return add_course()
    
    
def all_courses():
    with next(get_db()) as db:
        courses = (
            db.query(Courses)
            .options(
                joinedload(Courses.entity),
                joinedload(Courses.location),
                joinedload(Courses.area),
            )
            .all()
        )
    if not courses:
        return jsonify({"message": "Empty table"}), 200

    courses_list = [
            {
                "id": course.id,
                "name": course.name,
                "area_id": course.area_id,
                "area_name": course.area.name,
                "description": course.description,
                "entity_id": course.entity_id,
                "entity_name": course.entity.name,
                "duration": course.duration,
                "location_id": course.location_id,
                "location_name": course.location.name,
                "price": course.price,
            }
            for course in courses    
    ]
    return jsonify(courses_list), 200

def add_course():
   with next(get_db()) as db:
    data = request.get_json()

    required_fields = ['id', 'name', 'area_id','description', 'duration']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
    try:
        new_course = create_course(db, data)
        return new_course,200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@app.route('/courses/<id>', methods=['GET'])
def get_course(id:UUID):
    with next(get_db()) as db:

        course_to_edit = db.query(Courses).filter(Courses.id == id).first()

        if not course_to_edit:
            logging.error(f"Course not found in get_course")
            return jsonify({"error": f"Course with ID {id} not found"}), 404
        
        return jsonify(course_to_edit.to_dict())

@app.route('/courses/delete/<uuid:id>', methods=['DELETE'])
def delete_course(id:UUID):
        with next(get_db()) as db:
            try:
                course_to_delete = db.query(Courses).filter(Courses.id == id).first()

                if not course_to_delete:
                    return jsonify({"error": f"Course with ID {id} not found"}), 404
                
                db.delete(course_to_delete)
                db.commit()
                
                return jsonify({"message": f"Course with ID {id} deleted successfully"}), 200
            
            except Exception as e:
                print(f"Error deleting course: {e}")
                db.rollback()
                return jsonify({"error": "Failed to delete course"}), 500

@app.route('/courses/update/<uuid:id>', methods=['PUT'])
def edit_course(id:UUID):
    with next(get_db()) as db:
        data = request.get_json()

        try:
            edited_course = update_course(db, data)
            return jsonify(edited_course),200
    
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error"}), 500   

@app.route('/entities', methods=['GET', 'POST'] )
def handle_entities():    
    if request.method == 'GET':
       return all_entities()
    if request.method == 'POST':
        return add_entity()
    
def all_entities():
    try:
        with next(get_db()) as db:

            entities = db.query(Entity).all()
            
        if not entities:
            return jsonify({"message": "Empty table"}), 200

        entities_list = [
                {
                    "id": entity.id,
                    "name": entity.name,
                }
                for entity in entities    
        ]
        return jsonify(entities_list), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500  

def add_entity():
   with next(get_db()) as db:
    data = request.get_json()

    if not data.get('name'):
            return jsonify({"error": "Missing required field: name"}), 400
    
    try:
        new_entity = create_entity(db, data)
        return new_entity,200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/area', methods=['GET', 'POST'] )
def handle_area():    
    if request.method == 'GET':
       return all_area()
    if request.method == 'POST':
        return add_area()
    
def all_area():
    try:

        with next(get_db()) as db:
            area = db.query(Area).all()
        if not area:
            return jsonify({"message": "Empty table"}), 200

        area_list = [
                {
                    "id": item.id,
                    "name": item.name,
                }
                for item in area    
        ]
        return jsonify(area_list), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500     
def add_area():
   with next(get_db()) as db:
    data = request.get_json()

    try:
        new_area = create_area(db, data)
        return new_area,200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@app.route('/location', methods=['GET', 'POST'] )
def handle_location():    
    if request.method == 'GET':
       return all_location()
    if request.method == 'POST':
        return add_location()
    
def all_location():
    try:
        with next(get_db()) as db:
            location = db.query(Location).all()
        if not location:
            return jsonify({"message": "Empty table"}), 200

        location_list = [
                {
                    "id": item.id,
                    "name": item.name,
                }
                for item in location    
        ]
        return jsonify(location_list), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500  

def add_location():
   with next(get_db()) as db:
    data = request.get_json()

    try:
        print('data request before creation:', data)
        new_location = create_location(db, data)
        print('new location in main:', new_location)
        return new_location,200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@app.route('/files/uploads', methods=['POST','OPTIONS'])
@cross_origin(origin='localhost',headers=['Content-Type','Authorization'])
def upload_file():
    try:

        if request.method == 'OPTIONS':
            return jsonify({"message": "CORS preflight request successful"}), 200
        if request.method == 'POST':

            if 'file' not in request.files:
                return jsonify({"error": "No file part"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)

            file.save(file_path)  
            upload_date = datetime.datetime.now()

            file_metadata = {
                "fileName": filename,
                "fileUrl":  f"/uploads/{filename}",
                "fileSize": os.path.getsize(file_path),
                "uploadDate": upload_date,
            }
        return jsonify({"message": f"File {file.filename} uploaded successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@app.route('/files/list', methods=['GET'])
def list_files():
        try:

            files = os.listdir(UPLOAD_FOLDER)

            file_list = []
            for filename in files:
                if filename.lower().endswith('.pdf'):
                    file_path = os.path.join(UPLOAD_FOLDER, filename)
                    upload_date = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
                    file_list.append({
                        'filename': filename,
                        'fileUrl': f"download/{filename}",
                        'filesize': os.path.getsize(file_path),
                        'uploadDate': upload_date,
                    })
                
            return jsonify(file_list,200)
        except Exception as e:
            return jsonify({"error": "Internal server error"}), 500
        
@app.route('/files/<filename>', methods=['GET'])
def get_file(filename):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        mime_type, _ = mimetypes.guess_type(file_path)
        mime_type = mime_type or 'application/octet-stream'

        response = send_file(file_path, as_attachment=False, mimetype=mime_type)
        response.headers["Content-Type"] = mime_type  
        return response

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/files/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return jsonify({"message": f"File {filename} deleted successfully!"}), 200
        except Exception as e:
            logging.error(f"Unexpected error in delete_file: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    return jsonify({"error": "File not found"}), 404

@app.route('/download/<filename>', methods=['GET'])
def download(filename):
    try:       
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
   
@app.route('/test', methods=['GET'])
def test():
    return "works"

@app.route('/start', methods=['GET'])
def start_scheduled_job():
    try:
        start_job()
        return jsonify({"status": "- job scheduling STARTED"})
        
    except Exception:
        return jsonify({"error": "Internal error"}), 500
    
@app.route('/stop', methods=['GET'])
def stop_scheduled_job():
    try:
        stop_job()
        return jsonify({"status": "- job scheduling STOPPED"})
    except Exception:
        return jsonify({"error": "Internal error"}), 500
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
    db.create_all()