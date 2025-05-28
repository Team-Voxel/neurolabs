import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import type { ContinuousDistribution, DiscreteDistribution, ColumnDistributions } from "../../backend_api/types";
import { Flex, Spin, Select, Typography } from "antd";

const chartOptions : any = {
  series: [44, 55, 13, 33],
  options: {
    labels: ["Comedy", "Action", "SciFi", "Drama"],
    chart: {
      width: 380,
      type: 'donut',
    },
    dataLabels: {
      enabled: true
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          show: true
        }
      }
    }],
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230,
    }
  },
};

const generateBoxPlotData = (data: ColumnDistributions): {[key: string]: any} => {
    console.log("Generating box plot data with:", data);
    const chartData: any = {};
    chartData['series'] = [];
    chartData['options'] = {
        chart: {
            type: 'boxPlot',
            height: 350
        },
        title: {
          text: 'Numerical Distributions',
          align: 'left'
        },
        plotOptions: {
          boxPlot: {
            colors: {upper: '#5C4742', lower: '#A5978B'}
          }
        }
    }
    
    if (!data) {
        console.warn("Data is undefined in generateBoxPlotData");
        return chartData;
    }

    Object.keys(data).forEach((column) => {
        const dist = data[column];
        console.log("Processing column:", column, "with distribution:", dist);
        
        if (dist && dist.type === 'continuous') {
            const contDist = dist as ContinuousDistribution;
            console.log("Continuous distribution data:", contDist);
            
            if (contDist.min !== undefined && contDist.q1 !== undefined && 
                contDist.q2 !== undefined && contDist.q3 !== undefined && 
                contDist.max !== undefined) {
                    
                chartData['series'].push({
                    type: 'boxPlot',
                    data: [{
                        x: column, 
                        y: [contDist.min, contDist.q1, contDist.q2, contDist.q3, contDist.max]
                    }]
                });
            } else {
                console.warn(`Missing required data for column ${column}:`, contDist);
            }
        }
    });
    
    console.log("Generated chart data:", chartData);
    return chartData;
}

const generateDonutChartSetData = (data: ContinuousDistribution | DiscreteDistribution, column: string): any => {
    console.log("Generating donut chart data for column:", column, "with data:", data);
    const chartData: any = {};
    chartData['series'] = [];
    chartData['options'] = {
        chart: {
            type: 'donut',
        },
        title: {
            text: 'Categorical Distributions',
            align: 'left'
        }
    }

    if (!data || data.type !== 'discrete') {
        console.warn("Invalid data for donut chart:", data);
        return chartData;
    }

    const catDist = data as DiscreteDistribution;
    if (!catDist.value_counts) {
        console.warn("No value counts found in discrete distribution:", catDist);
        return chartData;
    }

    const values = Object.values(catDist.value_counts);
    const labels = Object.keys(catDist.value_counts);

    chartData['series'] = [values];
    chartData['options']['labels'] = labels;
    chartData['options']['title']['text'] = column;

    console.log("Generated donut chart data:", chartData);
    return chartData;
}

const generateAllDonutChartSetData = (data: ColumnDistributions): {[key: string]: any} => {
    const all: {[key: string]: any} = {};
    Object.keys(data).forEach((column) => {
      if (data[column].type === 'discrete') {
        all[column] = generateDonutChartSetData(data[column], column);
      }
    });
    return all;
}

export interface DistributionModelProps {
  data: ColumnDistributions | null;
}

export const DistributionModel: React.FC<DistributionModelProps> = ({data}) => {
    const [boxPlotData, setBoxPlotData] = useState<any>(null);
    const [donutData, setDonutData] = useState<{[key: string]: any} | null>(null);
    const [selected, setSelected] = useState<string | null>('');
    
    useEffect(() => {
        console.log("DistributionModel received data:", data);
        if (data && Object.keys(data).length > 0) {
            const boxPlot = generateBoxPlotData(data);
            const donutCharts = generateAllDonutChartSetData(data);
            console.log("Setting state with:", { boxPlot, donutCharts });
            setBoxPlotData(boxPlot);
            setDonutData(donutCharts);
            setSelected(Object.keys(donutCharts)[0]);
        }
    }, [data]);

    return (
        <div className="w-full h-full">
            <Flex>
              {boxPlotData && <Chart options={boxPlotData.options} series={boxPlotData.series} type="boxPlot" height='500px'  />}
            </Flex>
            <Flex vertical>
              {donutData && selected && (
                <>
                  <div className='flex justify-between w-full my-4'>
                    <Typography.Title level={5}>Select Problem Type</Typography.Title>
                    <div className="w-48">
                      <Select 
                        value={selected}
                        options={Object.keys(donutData).map((column) => ({label: column, value: column}))}
                        onChange={(value) => setSelected(value)}
                      />
                    </div>
                  </div>
                  <Chart 
                    key='donut'
                    options={donutData[selected].options} 
                    series={donutData[selected].series} 
                    type="donut" 
                    height='100%'  
                  />
                </>
              )}
            </Flex>
        </div>
    );
}