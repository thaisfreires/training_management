import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import UpdateCourse from '../Form/EditCourseForm';
import UploadFilesForm from '../Form/Upload_form';

const UploadFiles = () => {
  return (
    <>
      <Breadcrumb pageName="Update Course" />

      <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <UploadFilesForm />
      </div>
    </>
  );
};

export default UploadFiles;
