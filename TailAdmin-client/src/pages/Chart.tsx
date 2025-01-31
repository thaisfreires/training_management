import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ChartThree from '../components/Charts/ChartThree';
import ChartOne from '../components/Charts/ChartOne';

const Chart: React.FC = () => {
  return (
    <>
      <Breadcrumb pageName="Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
        <ChartThree />
      </div>
    </>
  );
};

export default Chart;
