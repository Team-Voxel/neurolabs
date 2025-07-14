import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Layout, Config, Data } from 'plotly.js';

// --- TypeScript Interfaces for Type Safety ---

/**
 * Defines the structure for a single data series (trace) for the chart.
 */
export interface PlotlyTrace {
  x: number[];
  y: number[];
  name?: string;
  color?: string;
}

/**
 * Defines the allowed interpolation shapes for the line chart.
 */
export type InterpolationType = 'linear' | 'spline' | 'hv' | 'vh' | 'hvh' | 'vhv';

/**
 * Defines the props for the reusable PlotlyChart component.
 */
export interface PlotlyChartProps {
  data: PlotlyTrace[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  interpolation?: InterpolationType;
  isAreaChart?: boolean;
  className?: string;
}

/**
 * A reusable React wrapper component for Plotly line and area charts, written in TypeScript.
 */
export const LineAreaChart: React.FC<PlotlyChartProps> = ({
  data = [],
  title = 'Chart Title',
  xAxisLabel = 'X-Axis',
  yAxisLabel = 'Y-Axis',
  interpolation = 'linear',
  isAreaChart = false,
  className = ''
}) => {
  // Map the user-friendly data prop to Plotly's expected data format
  const plotlyData: Data[] = data.map((trace, index) => ({
    x: trace.x,
    y: trace.y,
    name: trace.name || `Trace ${index + 1}`,
    type: 'scatter',
    mode: 'lines',
    line: {
      shape: interpolation,
      color: trace.color, // Allow custom color per trace
    },
    // Fill to the x-axis to create an area chart effect
    fill: isAreaChart ? 'tozeroy' : 'none',
    fillcolor: isAreaChart && trace.color ? `${trace.color}40` : undefined, // Semi-transparent fill
    hoverinfo: 'x+y+name',
  }));

  // Configure the chart's layout using Plotly's Layout type
  const plotlyLayout: Partial<Layout> = {
    title: {
      text: title,
      font: {
        size: 24,
        color: '#222222' // slate-200
      }
    },
    xaxis: {
      title: {
        text: xAxisLabel,
        font: {
          size: 16,
          color: '#94a3b8' // slate-400
        }
      },
      tickfont: {
        color: '#94a3b8' // slate-400
      },
      gridcolor: '#334155', // slate-700
      zerolinecolor: '#475569', // slate-600
    },
    yaxis: {
      title: {
        text: yAxisLabel,
        font: {
          size: 16,
          color: '#94a3b8' // slate-400
        }
      },
      tickfont: {
        color: '#94a3b8' // slate-400
      },
      gridcolor: '#334155', // slate-700
      zerolinecolor: '#475569', // slate-600
    },
    // Use minimal margins
    margin: { l: 60, r: 30, b: 50, t: 80 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    legend: {
      font: {
        color: '#e2e8f0' // slate-200
      }
    },
    autosize: true,
  };

  // Configure chart behavior
  const plotlyConfig: Partial<Config> = {
    responsive: true,
    displaylogo: false,
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={plotlyConfig}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};