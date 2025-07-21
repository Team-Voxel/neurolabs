import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// --- Common Props & Options (to avoid duplication) ---

interface BaseChartProps {
  /**
   * The data series for the chart. The format depends on the chart type.
   */
  series: any;
  /**
   * Optional: A title to display above the chart.
   */
  title?: string;
  /**
   * Optional: Custom ApexCharts options. These will be merged with the defaults.
   */
  options?: ApexOptions;
  /**
   * Optional: The height of the chart. Can be a number (pixels) or a string (e.g., '500px').
   * @default 350
   */
  height?: string | number;
}

const getCommonDefaultOptions = (title?: string): ApexOptions => ({
  chart: {
    fontFamily: 'Arial, sans-serif',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  title: {
    text: title,
    align: 'left',
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
    },
  },
  dataLabels: {
    enabled: false,
  },
});

// --- 1. HeatmapChart Component ---

/**
 * A reusable React wrapper for rendering an ApexCharts heatmap.
 */
export const HeatmapChart: React.FC<BaseChartProps> = ({
  series,
  title,
  options: customOptions,
  height = 350,
}) => {
  const heatmapDefaultOptions: ApexOptions = {
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: -30, to: 5, name: 'low', color: '#00A100' },
            { from: 6, to: 20, name: 'medium', color: '#128FD9' },
            { from: 21, to: 45, name: 'high', color: '#FFB200' },
            { from: 46, to: 55, name: 'extreme', color: '#FF0000' },
          ],
        },
      },
    },
    stroke: {
      width: 1,
    },
  };

  const mergedOptions = {
    ...getCommonDefaultOptions(title),
    ...heatmapDefaultOptions,
    ...customOptions, // User-provided options take highest precedence
  };
  
  if (!series || series.length === 0) {
    // Error handling
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px', textAlign: 'center', height }}>Error: `series` data is missing or empty.</div>;
  }

  return (
    <div className="heatmap-chart-container" style={{ width: '100%' }}>
      <Chart
        options={mergedOptions}
        series={series}
        type="heatmap"
        height={height}
        width="100%"
      />
    </div>
  );
};

// --- 2. BoxplotChart Component ---

/**
 * A reusable React wrapper for rendering an ApexCharts box plot.
 */
export const BoxplotChart: React.FC<BaseChartProps> = ({
  series,
  title,
  options: customOptions,
  height = 350,
}) => {
  const boxplotDefaultOptions: ApexOptions = {
    plotOptions: {
      boxPlot: {
        colors: {
          upper: '#5C4742',
          lower: '#A5978B',
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
    },
  };
  
  const mergedOptions = {
    ...getCommonDefaultOptions(title),
    ...boxplotDefaultOptions,
    ...customOptions,
  };

  if (!series || series.length === 0) {
    // Error handling
    return <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px', textAlign: 'center', height }}>Error: `series` data is missing or empty.</div>;
  }

  return (
    <div className="boxplot-chart-container" style={{ width: '100%' }}>
      <Chart
        options={mergedOptions}
        series={series}
        type="boxPlot"
        height={height}
        width="100%"
      />
    </div>
  );
};


// --- EXAMPLE USAGE ---
// You can place this in your App.tsx to see the new components in action.
/*
import React from 'react';
// Import the new named components
import { HeatmapChart, BoxplotChart } from './ApexChartComponents'; // Adjust the import path

// Helper function to generate sample heatmap data
const generateHeatmapData = () => {
  const data = Array.from({length: 8}, (_, i) => ({
      name: `Series ${i+1}`,
      data: Array.from({length: 12}, (_, j) => ({
          x: `Month ${j+1}`,
          y: Math.floor(Math.random() * 60) - 20
      }))
  }));
  return data;
};

// Helper function to generate sample boxplot data
const generateBoxplotData = () => {
  // Boxplot data format: [{ x: 'Category', y: [min, q1, median, q3, max] }]
  return [
    { x: 'Jan 2025', y: [54, 66, 69, 75, 88] },
    { x: 'Feb 2025', y: [43, 65, 69, 76, 81] },
    { x: 'Mar 2025', y: [31, 39, 45, 51, 59] },
    { x: 'Apr 2025', y: [39, 46, 55, 65, 71] },
    { x: 'May 2025', y: [29, 31, 35, 39, 44] },
    { x: 'Jun 2025', y: [41, 49, 58, 61, 67] },
  ];
};

const App: React.FC = () => {
  // For boxplot, the series is an array containing one object with the data
  const boxplotSeries = [{ type: 'boxPlot', data: generateBoxplotData() }];

  // Custom options to override the defaults for the boxplot
  const customBoxplotOptions: ApexOptions = {
      chart: {
        background: '#f9f9f9',
      },
      title: {
          text: 'Monthly Distribution of Values (Custom Title)',
          align: 'center',
      },
      xaxis: {
          type: 'category',
          title: { text: 'Month' }
      },
      yaxis: {
          title: { text: 'Value Range' },
          tooltip: { enabled: true }
      }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      <div>
        <h1 style={{ textAlign: 'center' }}>ApexCharts Heatmap Example</h1>
        <HeatmapChart
          series={generateHeatmapData()}
          title="Monthly Metric Analysis"
          height={400}
        />
      </div>

      <hr style={{border: '1px solid #eee'}} />

      <div>
        <h1 style={{ textAlign: 'center' }}>ApexCharts Box Plot Example</h1>
        <BoxplotChart
          series={boxplotSeries}
          options={customBoxplotOptions}
          height={450}
        />
      </div>

    </div>
  );
};

// Assuming you save this file as `ApexChartComponents.tsx`
// export default App;
*/
