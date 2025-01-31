import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CardData from '../../components/CardData';


const AvailableCourses = () => {
  return (
    <>
      <Breadcrumb pageName="Available Training Courses" />
      
      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <CardData />
      </div>
    </>
  );
};

export default AvailableCourses;
