import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import NewCourseForm from "../../pages/Form/NewCourseForm";

const NewCourse = () => {
    return (
      <>
        <Breadcrumb pageName="New Course" />
  
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <NewCourseForm />
        </div>
      </>
    );
  };
  
  export default NewCourse;