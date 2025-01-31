import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FaBook, FaListAlt, FaPencilAlt, FaLocationArrow, FaBuilding, FaMoneyBill, FaClock } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { v4 as uuid, UUIDTypes } from 'uuid';
import AlertItem from '../../components/Alerts/AlertItem';

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
interface Option {
    id: string;
    name: string;
  }
const UpdateCourse: React.FC = () => {
  
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const courseId = localStorage.getItem('editCourseId');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [newData, setNewData] = useState({
    id: uuid(),
    name: '',
    description: '',
    duration: '',
    area_id: '',
    location_id: '',
    entity_id: '',
    price: '',
    area_name: '',
    location_name: '',
    entity_name: '',
  });

  const [entities, setEntities] = useState<Option[]>([]);
  const [area, setArea] = useState<Option[]>([]);
  const [location, setLocation] = useState<Option[]>([]);
  

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    setNewData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    field: string,
    idField: string
  ) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const value = event.target.value;

    setNewData((prevData) => ({
      ...prevData,
      [field]: selectedOption.text, 
      [idField]: value,
    }));
  };

  useEffect(() => {
      const fetchCourse = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:5000/courses/${courseId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch course');
          }
          const data = await response.json();
          setNewData({
            id: data.id,
            name: data.name,
            description: data.description,
            duration: data.duration,
            price: data.price,
            area_id: data.area?.id || '',
            area_name: data.area?.name || '',
            entity_id: data.entity?.id || '',
            entity_name: data.entity?.name || '',
            location_id: data.location?.id || '',
            location_name: data.location?.name || '',
          });
        } catch (error) {
          setError(error.message);
        }
      };
    const fetchOptions = async () => {
      try {
        const [locationsRes, entitiesRes, areasRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/location', { headers: { 'Content-Type': 'application/json' }}),
          fetch('http://127.0.0.1:5000/entities', { headers: { 'Content-Type': 'application/json' }}),
          fetch('http://127.0.0.1:5000/area', { headers: { 'Content-Type': 'application/json' }}),
        ]);
        const locationsData: Option[] = await locationsRes.json();
        const entitiesData: Option[] = await entitiesRes.json();
        const areasData: Option[] = await areasRes.json();

        setLocation(locationsData);
        setEntities(entitiesData);
        setArea(areasData);

      } catch (error) {
        console.error('Error fetching select options:', error);
      }
    };
    
    fetchCourse();
    fetchOptions();
  }, [courseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      let areaId = newData.area_id;
      let entityId = newData.entity_id;
      let locationId = newData.location_id;
  
      if (!areaId && newData.area_name) {
        const areaResponse = await fetch('http://127.0.0.1:5000/area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newData.area_name }),
        });
  
        if (areaResponse.ok) {
          const areaData = await areaResponse.json();
          areaId = areaData.id;
          if (!areaId) throw new Error('Area ID not returned from the server.');
        } else {
          throw new Error('Failed to create Area');
        }
      }
  
      if (!entityId && newData.entity_name) {
        const entityResponse = await fetch('http://127.0.0.1:5000/entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newData.entity_name }),
        });
  
        if (entityResponse.ok) {
          const entityData = await entityResponse.json();
          entityId = entityData.id;
          if (!entityId) throw new Error('Entity ID not returned from the server.');
        } else {
          throw new Error('Failed to create Entity');
        }
      }
  
      if (!locationId && newData.location_name) {
        const locationResponse = await fetch('http://127.0.0.1:5000/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newData.location_name }),
        });
  
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          locationId = locationData.id;
          if (!locationId) throw new Error('Location ID not returned from the server.');
        } else {
          throw new Error('Failed to create Location');
        }
      }
  
      const courseForm = {
        id: newData.id,
        name: newData.name,
        description: newData.description,
        duration: newData.duration,
        price: newData.price,
        area_id: areaId,
        entity_id: entityId,
        location_id: locationId,
      };
      
      const courseResponse = await fetch(`http://127.0.0.1:5000/courses/update/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });

      if (courseResponse.ok) {
        setAlert({ type: 'success', message: 'Course successfully Updated!' });
      } else {
        const error = await courseResponse.json();
        setAlert({ type: 'error', message: `Failed to save course: ${error.message || 'Unknown error'}` });
      }
    } catch (error: any) {
      console.error('Error submitting form:', error.message);
      setAlert({ type: 'error', message: `Error: ${error.message}` });
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Update Course" />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        
        <div className="flex flex-col gap-9">
          <div className="col-span-5 xl:col-span-3">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="p-7">
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="mb-1 mt-0">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-1 px-2.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="id"
                        id="id"
                        value={courseId}
                        hidden
                        required
                      />
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="name"
                      >
                        <FaBook className="inline mr-2 text-primary" /> Course
                        Name
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="name"
                        id="name"
                        value={newData.name}
                        onChange={handleChange}
                        placeholder="Enter the course name"
                        required
                      />
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="description"
                      >
                        <FaPencilAlt className="inline mr-2 text-primary" /> Course
                        Description
                      </label>
                      <textarea
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="description"
                        id="description"
                        rows="5"
                        value={newData.description}
                        onChange={handleChange}
                        placeholder="Enter a brief description of the course"
                        required
                      ></textarea>
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="duration"
                      >
                        <FaClock className="inline mr-2 text-primary" /> Course
                        Duration (in hours)
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="number"
                        name="duration"
                        id="duration"
                        value={newData.duration}
                        onChange={handleChange}
                        placeholder="e.g., 40"
                        required
                      />
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="price"
                      >
                        <FaMoneyBill className="inline mr-3 text-primary" /> Price
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="float"
                        name="price"
                        id="price"
                        value={newData.price}
                        onChange={handleChange}
                        placeholder="€"
                      />
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="entity"
                      >
                        <FaBuilding className="inline mr-2 text-primary" /> Entity
                      </label>
                      <select
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="entity_id"
                        id="entity_id"
                        value={newData.entity_id}
                        onChange={(e) =>
                          handleSelectChange(e, 'entity_name', 'entity_id')
                        }
                      >
                        <option value="">Create new Entity</option>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                      <div className="mb-5.5 mt-3">
                        {newData.entity_id === '' && (
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="entity_name"
                          id="entity_name"
                          value={newData.entity_name}
                          onChange={handleChange}
                          
                        />
                        )}
    
                      </div>
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="location"
                      >
                        <FaLocationArrow className="inline mr-2 text-primary" /> Location
                      </label>
                      <select
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="location_id"
                        id="location_id"
                        value={newData.location_id}
                        onChange={(e) =>
                          handleSelectChange(e, 'location_name', 'location_id')
                        }
                      >
                        <option value="">Create new Location</option>
                        {location.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                      <div className="mb-5.5 mt-3">
                        {newData.location_id === '' && (
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="location_name"
                          id="location_name"
                          value={newData.location_name}
                          onChange={handleChange}
                          
                        />
                        )}
    
                      </div>
                    </div>
  
                    <div className="py-4 px-6.5 dark:border-strokedark">
                      <label
                        className="mb-2.5 block text-black dark:text-white"
                        htmlFor="area"
                      >
                        <FaListAlt className="inline mr-2 text-primary" /> Department
                      </label>
                      <select
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        name="area_id"
                        id="area_id"
                        value={newData.area_id}
                        onChange={(e) => handleSelectChange(e, 'area_name', 'area_id')}
                      >
                        <option value="">Create new Area</option>
                        {area.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                      <div className="mb-5.5 mt-3">
                        {newData.area_id === '' && (
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="area_name"
                          id="area_name"
                          value={newData.area_name}
                          onChange={handleChange}
                        />
                        )}
    
                      </div>
                    </div>
                  <div>
                      {alert && <AlertItem type={alert.type} message={alert.message} />}
                      <button
                      type="submit"
                      className="mt-6 inline-flex items-center justify-center rounded bg-primary py-3 px-10 font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-dark"
                    >
                      Update Course
                    </button>
                  </div>
                  
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>    
  );        
};  
export default UpdateCourse;
