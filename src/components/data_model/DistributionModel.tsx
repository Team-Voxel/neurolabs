import React from "react";
import Chart from "react-apexcharts";
import type { DFContDist, DFDistribution } from "../../backend_api/types";

const chartOptions : any = {
    series: [
    {
      type: 'boxPlot',
      data: [
        {
          x: 'Jan 2015',
          y: [54, 66, 69, 75, 88]
        },
        {
          x: 'Jan 2016',
          y: [43, 65, 69, 76, 81]
        },
        {
          x: 'Jan 2017',
          y: [31, 39, 45, 51, 59]
        },
        {
          x: 'Jan 2018',
          y: [39, 46, 55, 65, 71]
        },
        {
          x: 'Jan 2019',
          y: [29, 31, 35, 39, 44]
        },
        {
          x: 'Jan 2020',
          y: [41, 49, 58, 61, 67]
        },
        {
          x: 'Jan 2021',
          y: [54, 59, 66, 71, 88]
        }
      ]
    }
  ],
    options: {
    chart: {
      type: 'boxPlot',
      height: 350
    },
    title: {
      text: 'Basic BoxPlot Chart',
      align: 'left'
    },
    plotOptions: {
      boxPlot: {
        colors: {
          upper: '#5C4742',
          lower: '#A5978B'
        }
      }
    }
  }
};

const generateChartData = (data : DFDistribution) => {
    const chartData : any = {};
    if (data.type === 'continuous') {
        const contDist = data.spec as {[column: string]: DFContDist};
        Object.keys(contDist).forEach((column) => {
            const dist = contDist[column];
            chartData['series'].push({
                type: 'boxPlot',
                data: [{x: column, y: [dist.min, dist.q1, dist.q2, dist.q3, dist.max]}]
            });
        });
    }
}

export const DistributionModel: React.FC = () => {

    return (
        <div className="w-full h-full">
            <Chart options={chartOptions.options} series={chartOptions.series} type="boxPlot" height='100%'  />
        </div>
    );
}