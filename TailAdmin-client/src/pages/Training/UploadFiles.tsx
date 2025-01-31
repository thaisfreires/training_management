import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import UploadFilesForm from "../Form/Upload_form";

const UploadFiles = () => {
    return (
      <>
        <Breadcrumb pageName="Upload Reports" />
  
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <UploadFilesForm />
        </div>
      </>
    );
  };
  
  export default UploadFiles;