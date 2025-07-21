import React from 'react';
import Plot from 'react-plotly.js';

/**
 * A React component to visualize a 2D multiclass dataset as a scatter plot,
 * with optional highlighting for support vectors.
 *
 * @param {object} props - The component's props.
 * @param {number[][]} props.X - A 2D array representing the features (e.g., [[x1, y1], [x2, y2], ...]).
 * @param {number[]} props.Y - A 1D array of integer labels corresponding to each data point in X.
 * @param {number[]} [props.supportVectorIndices=[]] - An array of indices of data points in X that are support vectors.
 * @param {string} [props.title='2D Multiclass Scatter Plot with Support Vectors'] - The title of the plot.
 * @param {string} [props.xLabel='X-axis'] - The label for the x-axis.
 * @param {string} [props.yLabel='Y-axis'] - The label for the y-axis.
 * @param {string[]} [props.colors=['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52']] - An array of hex color codes for different classes.
 * @param {number} [props.markerSize=7] - Default marker size.
 * @param {number} [props.svMarkerSize=10] - Marker size for support vectors.
 * @param {string} [props.svMarkerBorderColor='black'] - Border color for support vector markers.
 * @param {number} [props.svMarkerBorderWidth=2] - Border width for support vector markers.
 * @returns {JSX.Element} A Plotly scatter plot.
 */

type MulticlassScatterPlotWithSVMProps = {
    X: number[][];
    Y: number[];
    supportVectorIndices?: number[];
    title?: string;
    xLabel?: string;
    yLabel?: string;
    colors?: string[];
    markerSize?: number;
    svMarkerSize?: number;
    svMarkerBorderColor?: string;
    svMarkerBorderWidth?: number;
}

const MulticlassScatterPlotWithSVM: React.FC<MulticlassScatterPlotWithSVMProps> = ({
  X,
  Y,
  supportVectorIndices = [],
  title = '2D Multiclass Scatter Plot with Support Vectors',
  xLabel = 'X-axis',
  yLabel = 'Y-axis',
  colors = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52'],
  markerSize = 7,
  svMarkerSize = 10,
  svMarkerBorderColor = 'black',
  svMarkerBorderWidth = 2,
}) => {
  if (!X || !Y || X.length !== Y.length || X.length === 0) {
    return <p>Please provide valid X and Y data.</p>;
  }

  if (X.some(point => point.length !== 2)) {
    return <p>Each point in X should have exactly two dimensions.</p>;
  }

  const uniqueLabels = [...new Set<number>(Y)].sort((a: number, b: number) => a - b);
  const supportVectorSet = new Set<number>(supportVectorIndices);

  const data = uniqueLabels.map(label => {
    const xValues: number[] = [];
    const yValues: number[] = [];
    const markerSizes: number[] = [];
    const markerBorderColors: string[] = [];
    const markerBorderWidths: number[] = [];

    Y.forEach((currentLabel, index) => {
      if (currentLabel === label) {
        xValues.push(X[index][0]);
        yValues.push(X[index][1]);

        if (supportVectorSet.has(index)) {
          markerSizes.push(svMarkerSize);
          markerBorderColors.push(svMarkerBorderColor);
          markerBorderWidths.push(svMarkerBorderWidth);
        } else {
          markerSizes.push(markerSize);
          markerBorderColors.push(colors[label % colors.length]); // Border same as fill for non-SVs or transparent
          markerBorderWidths.push(0); // No distinct border for non-SVs
        }
      }
    });

    return {
      x: xValues,
      y: yValues,
      mode: 'markers',
      type: 'scatter',
      name: `Class ${label}`,
      marker: {
        color: colors[label % colors.length], // Fill color
        size: markerSizes,
        line: {
          color: markerBorderColors,
          width: markerBorderWidths,
        },
      },
    };
  });

  const layout = {
    title: title,
    xaxis: {
      title: xLabel,
    },
    yaxis: {
      title: yLabel,
    },
    legend: {
      traceorder: 'normal',
    },
    autosize: true,
  };

  const config = {
    responsive: true,
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default MulticlassScatterPlotWithSVM;


export const AppWithSVM = () => {
    // Sample 2D multiclass data
    const sampleX = [
      [1, 2], [1.5, 1.8], [1.2, 2.5], [1.8, 2.2], // Class 0
      [3, 4], [3.5, 3.8], [3.2, 4.5], [2.8, 3.2], // Class 1
      [5, 1], [5.5, 1.8], [4.8, 0.5], [5.2, 1.2], // Class 2
      [2, 3.5], [2.5, 3.1],                          // Class 0 (more)
      [4, 2.5], [4.5, 2.1]                           // Class 1 (more)
    ];
    const sampleY = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 1, 1];
  
    // Assume these are the indices of support vectors identified by your SVM
    // For example, if X[1], X[3], X[4], X[7], X[8], X[11] are support vectors
    const supportVectorIndices: number[] = [1, 3, 4, 7, 8, 11];
  
    return (
      <div style={{ width: '80vw', height: '70vh', margin: '20px auto', border: '1px solid #ccc' }}>
        <h1>Dataset with SVM Support Vectors</h1>
        <MulticlassScatterPlotWithSVM
          X={sampleX}
          Y={sampleY}
          supportVectorIndices={supportVectorIndices}
          title="Data with Highlighted Support Vectors"
          xLabel="Feature 1"
          yLabel="Feature 2"
        />
      </div>
    );
  };