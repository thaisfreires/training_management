import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import AlertItem from "../../components/Alerts/AlertItem";

const Alerts = () => {
  return (
    <>
      <Breadcrumb pageName="Alerts" />
      <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-9">
        <div className="flex flex-col gap-7.5">
          <AlertItem type="warning" message="This is a warning alert!" />
          <AlertItem type="success" message="Operation completed successfully!" />
          <AlertItem type="error" message="There was an error with your submission." />
        </div>
      </div>
    </>
  );
};

export default Alerts;
