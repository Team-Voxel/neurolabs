import React from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout, Config } from 'plotly.js';

// --- Common Base Props ---
interface BasePlotlyProps {
  /**
   * Optional: A title to display above the chart.
   */
  title?: string;
  /**
   * Optional: Custom Plotly Layout options. These will be deeply merged with the defaults.
   */
  layout?: Partial<Layout>;
  /**
   * Optional: Custom Plotly Config options.
   */
  config?: Partial<Config>;
  /**
   * Optional: The height of the chart container.
   * @default '450px'
   */
  height?: string | number;
  
  margin?: {
    l?: number; // Left margin
    r?: number; // Right margin
    b?: number; // Bottom margin
    t?: number; // Top margin
    pad?: number; // Padding around the plot area
  }
}

// --- 1. PlotlyHeatmap Component ---

interface PlotlyHeatmapProps extends BasePlotlyProps {
  /**
   * A 2D array of numbers representing the heatmap values.
   * Example: [[1, 20, 30], [20, 1, 60], [30, 60, 1]]
   */
  z: number[][];
  /**
   * Optional: Labels for the x-axis.
   */
  xLabels?: string[] | number[];
  /**
   * Optional: Labels for the y-axis.
   */
  yLabels?: string[] | number[];
   /**
   * Optional: A predefined Plotly colorscale string (e.g., 'Viridis', 'RdBu') or a custom scale array.
   * @default 'Viridis'
   */
  colorscale?: string | (string | number)[][];

}

/**
 * A reusable React wrapper for rendering a Plotly.js heatmap.
 */
export const PlotlyHeatmap: React.FC<PlotlyHeatmapProps> = ({
  z,
  xLabels,
  yLabels,
  title,
  layout: customLayout,
  config: customConfig,
  height = '100%',
  colorscale = 'YlOrRd',
  margin = {
    l: 50, // Adjust as needed for y-axis labels/ticks
    r: 20, // Adjust as needed for legend or if no elements on right
    t: 20, // Adjust as needed for title
    b: 0, // Adjust as needed for x-axis labels/ticks
    pad: 0   // Minimal padding around the plot area itself
  },
}) => {

  if (!z || z.length === 0 || !Array.isArray(z[0])) {
    const errorStyle: React.CSSProperties = {
        color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px', 
        textAlign: 'center', height
    };
    return <div style={errorStyle}>Error: `z` data must be a valid 2D array.</div>;
  }

  const data: Data[] = [{
    z: z,
    x: xLabels,
    y: yLabels,
    type: 'heatmap',
    hoverongaps: false,
    colorscale: colorscale as any,
  }];

  const defaultLayout: Partial<Layout> = {
    title: {text: title as string},
    xaxis: { ticks: '', side: 'top' },
    yaxis: { ticks: '', side: 'left' },
    autosize: true,
    margin: margin,
  };

  // Deep merge layout objects - this is a simple implementation
  const mergedLayout = { ...defaultLayout, ...customLayout };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    ...customConfig,
  };

  return (
    <div style={{ width: '100%', height }}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};


// --- 2. PlotlyBoxplot Component ---

interface BoxplotData {
    /** The data points for this box plot. */
    y: number[];
    /** The name of this series, displayed on the axis and legend. */
    name: string;
    /** Optional: Additional Plotly options for this specific trace. */
    options?: Partial<Data>;
}

interface PlotlyBoxplotProps extends BasePlotlyProps {
  /**
   * An array of data series for the box plot.
   * Each object should contain the data `y` and a `name`.
   */
  series: BoxplotData[];
}

/**
 * A reusable React wrapper for rendering a Plotly.js box plot.
 */
export const PlotlyBoxplot: React.FC<PlotlyBoxplotProps> = ({
  series,
  title,
  layout: customLayout,
  config: customConfig,
  height = '450px',
  margin = { l: 40, r: 30, b: 80, t: 100 , pad: 0 } // Default margins,
}) => {

  if (!series || series.length === 0) {
      const errorStyle: React.CSSProperties = {
        color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px', 
        textAlign: 'center', height
    };
    return <div style={errorStyle}>Error: `series` data is missing or empty.</div>;
  }

const data: any[] = series.map((s: BoxplotData) => ({
    y: s.y,
    name: s.name,
    type: 'box',
    boxpoints: 'all', // Show all underlying data points
    jitter: 0.3,      // Spread out the points for better visibility
    pointpos: -1.8,   // Position points to the left of the box
    ...(s.options || {}),
  }));

  const defaultLayout: Partial<Layout> = {
    title: {text: title as string},
    yaxis: {
      autorange: true,
      showgrid: true,
      zeroline: true,
      dtick: 5,
      gridcolor: 'rgb(255, 255, 255)',
      gridwidth: 1,
      zerolinecolor: 'rgb(255, 255, 255)',
      zerolinewidth: 2,
    },
    margin: margin,
    paper_bgcolor: 'rgb(243, 243, 243)',
    plot_bgcolor: 'rgb(243, 243, 243)',
    showlegend: false,
    autosize: true,
  };

  const mergedLayout = { ...defaultLayout, ...customLayout };

  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false,
    ...customConfig,
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};
