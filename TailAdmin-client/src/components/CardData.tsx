import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UUIDTypes } from "uuid";

interface Course {
  id: UUIDTypes;
  name: string;
  description: string;
  area_id: string;
  area_name: string;  
  entity_id: string;
  entity_name: string;  
  location_id: string;
  location_name: string;  
  duration: string;
  price: string;
}

const Card = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchItem, setSearchItem] = useState('');
  const apiUrl =  process.env.API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${apiUrl}/courses`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleInputChange = (e: { target: { value: any; }; }) => {
    const search = e.target.value;
    setSearchItem(search);
  };

  const handleEdit= async (id: UUIDTypes) => {
    const idString = id.toString();
    localStorage.setItem('editCourseId', idString);
    navigate('/courses/update')
  };

  const handleDelete = async (id: UUIDTypes) => {
      try {
        const response = await fetch(`${apiUrl}/courses/delete/${id}`, { 
          method: 'DELETE',
          headers: { "Content-Type": "application/json" },
        }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        setCourses(courses.filter(course => course.id !== id));
      } catch (error) {
        setError(error.message);
      }
  }

  const filteredAndSortedCourses = searchItem
    ? courses.filter(course =>
        course.name.toLowerCase().includes(searchItem)
      ).concat(
        courses.filter(course =>
          !course.name.toLowerCase().includes(searchItem)
        )
      )
    : courses;

  return (
    <div className="mt-5 p-3">
      <div className="hidden sm:block">
          
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Search course..."
                value={searchItem}
                onChange={handleInputChange}
                
                className="w-full bg-transparent pl-9 pr-4 text-black focus:outline-none dark:text-white xl:w-125"

              />
            </div>
          
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 mt-3 ">
      {filteredAndSortedCourses.map((course) => (
        <div
          key={course.id}
          className="rounded-lg border border-gray-200 bg-gray-200 dark:bg-gray-800 shadow-lg p-6"
        >
          <img src="\images\logotipo-inova-adm-06.png" alt="Logo" className="w-16 h-16 mb-4 mx-auto" />
          <h2 className="text-xl dark:text-white text-black font-bold mb-2 text-center">{course.name}</h2>
          <p className="text-sm dark:text-white text-black mb-4 text-center">{course.description}</p>
          <ul className="text-sm text-black mb-4 dark:text-white">
            <li><strong>Department Area:</strong> {course.area_name}</li>
            <li><strong>Entity:</strong> {course.entity_name}</li>
            <li><strong>Location:</strong> {course.location_name}</li>
            <li><strong>Duration:</strong> {course.duration}</li>
            <li><strong>Price:</strong> {course.price}</li>
          </ul>
          <div className="flex justify-center space-x-2">
            <button
            
              onClick={() => handleEdit(course.id)}
              className="px-4 py-2 text-meta-3 rounded-md border border-meta-3 hover:bg-opacity-90"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(course.id)}
              className="px-4 py-2 text-primary rounded-md border border-primary hover:bg-opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};
export default Card;