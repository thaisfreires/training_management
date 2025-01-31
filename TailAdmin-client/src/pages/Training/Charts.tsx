import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import ChartThree from "../../components/Charts/ChartThree";

const Charts = () => {
    return (
      <>
        <Breadcrumb pageName="Training Management" />
  
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <ChartThree />
        </div>
      </>
    );
  };
  
  export default Charts;