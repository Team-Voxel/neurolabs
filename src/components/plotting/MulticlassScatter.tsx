import React from 'react';
import Plot from 'react-plotly.js';

/**
 * A React component to visualize a 2D multiclass dataset as a scatter plot.
 *
 * @param {object} props - The component's props.
 * @param {number[][]} props.X - A 2D array representing the features (e.g., [[x1, y1], [x2, y2], ...]).
 * @param {number[]} props.Y - A 1D array of integer labels corresponding to each data point in X.
 * @param {string} [props.title='2D Multiclass Scatter Plot'] - The title of the plot.
 * @param {string} [props.xLabel='X-axis'] - The label for the x-axis.
 * @param {string} [props.yLabel='Y-axis'] - The label for the y-axis.
 * @param {string[]} [props.colors=['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52']] - An array of hex color codes for different classes.
 * @returns {JSX.Element} A Plotly scatter plot.
 */

interface MulticlassScatterProps {
    X: number[][];
    Y: number[];
    title?: string;
    xLabel?: string;
    yLabel?: string;
    colors?: string[];
}

export const MulticlassScatterPlot: React.FC<MulticlassScatterProps> = ({
  X,
  Y,
  title = '2D Multiclass Scatter Plot',
  xLabel = 'X-axis',
  yLabel = 'Y-axis',
  colors = ['#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52'] // Default Plotly colors
}) => {
  if (!X || !Y || X.length !== Y.length || X.length === 0) {
    return <p>Please provide valid X and Y data.</p>;
  }

  if (X.some(point => point.length !== 2)) {
    return <p>Each point in X should have exactly two dimensions.</p>;
  }

  const uniqueLabels = [...new Set(Y)].sort((a, b) => a - b);
  const data = uniqueLabels.map(label => {
    const xValues: number[] = [];
    const yValues: number[] = [];
    Y.forEach((y: number, index: number) => {
      if (y === label) {
        xValues.push(X[index][0]);
        yValues.push(X[index][1]);
      }
    });
    return {
      x: xValues,
      y: yValues,
      mode: 'markers',
      type: 'scatter',
      name: `Class ${label}`,
      marker: { color: colors[label % colors.length] } // Cycle through colors if more labels than colors
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
    showlegend: false,
    legend: {
      // disable legend
      traceorder: 'normal',
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.02,
      xanchor: 'right',
      x: 1
    },
    hovermode: false,
    autosize: true,
    margin: {
      l: 20, // Adjust as needed for y-axis labels/ticks
      r: 20, // Adjust as needed for legend or if no elements on right
      t: 20, // Adjust as needed for title
      b: 20, // Adjust as needed for x-axis labels/ticks
      pad: 0   // Minimal padding around the plot area itself
    },
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