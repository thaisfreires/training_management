import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import TableThree from '../../components/Tables/TableThree';

const PendingTraining = () => {
    return (
      <>
        <Breadcrumb pageName="Pending Training Reports" />
  
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <TableThree />
        
        </div>
      </>
    );
  };
  
  export default PendingTraining;