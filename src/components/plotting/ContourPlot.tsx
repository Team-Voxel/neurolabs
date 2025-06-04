import React from 'react';
import Plot , { Contours, ContourTrace } from 'react-plotly.js';
import type { Data, Layout, Config, ColorScale} from 'plotly.js';

// Define the props for the ContourPlot component
interface PlotlyContourWrapperProps {
  /**
   * Array of 2D points, e.g., [[x1, y1], [x2, y2], ...]
   */
  X: number[][];
  /**
   * Array of z-values (e.g., measurements or class labels) corresponding to each point in X.
   */
  zValues: number[];
  /**
   * Optional title for the plot.
   * @default 'Contour Plot'
   */
  title?: string;
  /**
   * Optional label for the x-axis.
   * @default 'X-axis'
   */
  xLabel?: string;
  /**
   * Optional label for the y-axis.
   * @default 'Y-axis'
   */
  yLabel?: string;
  /**
   * Plotly colorscale. Can be a predefined string (e.g., 'Viridis', 'RdBu')
   * or a custom colorscale array.
   * Example for discrete classes 0, 1, 2: `[[0.0, 'red'], [0.5, 'green'], [1.0, 'blue']]`
   * (assumes zValues are normalized or zmin/zmax are set such that 0 maps to min, 0.5 to mid, 1.0 to max).
   * @default 'Viridis'
   */
  colorscale?: ColorScale | string;
  /**
   * Whether to show the color scale bar.
   * @default true
   */
  showscale?: boolean;
  /**
   * The number of contour levels. Has no effect if `contours.type` is 'constraint'.
   * If `contours.start`, `contours.end`, and `contours.size` are set, this is ignored.
   * Let Plotly decide by default if not set.
   */
  ncontours?: number;
  /**
   * Smoothing for contour lines. A value between 0 (no smoothing) and 1.3.
   * @default 0
   */
  lineSmoothing?: number;
  /**
   * Defines how contour levels are colored.
   * 'fill': Fills areas between contour lines.
   * 'heatmap': Colors areas based on z-values (like a heatmap).
   * 'lines': Draws only contour lines.
   * 'none': No coloring.
   * @default 'fill'
   */
  contourColoring?: 'fill' | 'heatmap' | 'lines' | 'none';
   /**
   * Color of the contour lines.
   * Relevant if `contourColoring` is 'lines' or if lines are shown with 'fill'.
   * Defaults to Plotly's auto-coloring based on context.
   */
  lineColor?: string;
  /**
   * Width of the contour lines.
   * @default 1.5
   */
  lineWidth?: number;
  /**
   * Advanced configuration for contour levels and appearance.
   * See Plotly.js documentation for `contours` object.
   * Example for class boundaries (classes 0, 1, 2): 
   * `{ start: -0.5, end: 2.5, size: 1, showlines: true }`
   */
  contours?: Partial<Contours>;
  /**
   * Whether to connect gaps in the data. Useful for scattered data.
   * @default true
   */
  connectgaps?: boolean;
  /**
   * Optional: Smooth the z-data itself before contouring.
   * 'fast': Faster, less precise smoothing.
   * 'best': Slower, more precise smoothing.
   * false: No z-data smoothing.
   * @default false
   */
  zsmooth?: 'fast' | 'best' | false;
}

/**
 * A React component that wraps Plotly.js to display a contour plot
 * for 2D scatter data (X coordinates and zValues at those coordinates).
 * Useful for visualizing scalar fields or class regions.
 */
const ContourPlot: React.FC<PlotlyContourWrapperProps> = ({
  X,
  zValues,
  title = 'Contour Plot',
  xLabel = 'X-axis',
  yLabel = 'Y-axis',
  colorscale = 'Viridis',
  showscale = true,
  ncontours, 
  lineSmoothing = 0,
  contourColoring = 'fill',
  lineColor, 
  lineWidth = 1.5,
  contours,
  connectgaps = true,
  zsmooth = false,
}) => {
  // Basic input validation
  if (!X || !zValues || X.length !== zValues.length || X.length === 0) {
    console.error('PlotlyContourWrapper: Invalid or mismatched X and zValues data. Ensure X and zValues are non-empty and have the same length.');
    return <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>Error: Invalid data provided to contour plot. Check console for details.</div>;
  }
  if (X.some(point => !Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'number' || typeof point[1] !== 'number')) {
    console.error('PlotlyContourWrapper: Each point in X should be an array of two numbers, e.g., [xCoord, yCoord].');
    return <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>Error: Invalid X data format. Check console for details.</div>;
  }
  if (zValues.some(val => typeof val !== 'number')) {
    console.error('PlotlyContourWrapper: All zValues must be numbers.');
     return <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>Error: Invalid zValues data format. Check console for details.</div>;
  }


  const xCoords = X.map(point => point[0]);
  const yCoords = X.map(point => point[1]);

  // Construct the contour trace data
  // Plotly requires 'Data' type for the trace, but 'ContourTrace' is more specific for type safety.
  const trace: ContourTrace = {
    x: xCoords,
    y: yCoords,
    z: zValues,
    type: 'contour',
    colorscale: colorscale,
    showscale: showscale,
    ncontours: ncontours,
    connectgaps: connectgaps,
    zsmooth: zsmooth,
    autocontour: (contours && (typeof contours.start !== 'undefined' && typeof contours.end !== 'undefined' && typeof contours.size !== 'undefined')) ? false : true, // Disable autocontour if specific levels are set
    contours: {
      coloring: contourColoring,
      // Show lines by default unless it's a heatmap style or explicitly turned off by user
      showlines: (contours && typeof contours.showlines !== 'undefined') ? contours.showlines : contourColoring !== 'heatmap',
      ...(contours || {}), // Spread user-provided contours object, allowing override
    },
    line: { // Styling for contour lines
      color: lineColor, // If undefined, Plotly will auto-assign or use default
      width: lineWidth,
      smoothing: lineSmoothing,
    },
  };

  // Define the layout for the plot
  const layout: Partial<Layout> = {
    xaxis: { title: {text :xLabel}, zeroline: false },
    yaxis: { title: {text :yLabel}, zeroline: false },
    autosize: true,
    hovermode: false, // Enhances interactivity
    margin: {
        l: 40, // Adjust as needed for y-axis labels/ticks
        r: 20, // Adjust as needed for legend or if no elements on right
        t: 10, // Adjust as needed for title
        b: 40, // Adjust as needed for x-axis labels/ticks
        pad: 0   // Minimal padding around the plot area itself
      },
  };

  // Define the configuration for the plot
  const config: Partial<Config> = {
    responsive: true,
    displaylogo: false, // Optionally hide the Plotly logo
  };

  return (
    <Plot
      data={[trace as Data]} // Cast to Data as react-plotly.js expects Data[]
      layout={layout}
      config={config}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true} // Recommended for responsiveness
    />
  );
};

export default ContourPlot;

// Example of how to use this component in another .tsx file:
/*
import React from 'react';
import PlotlyContourWrapper from './PlotlyContourWrapper'; // Adjust path as needed
import type { ColorScale, Contours } from 'plotly.js';

const App: React.FC = () => {
  const sampleX: number[][] = [
    [1, 1], [1, 2], [1.5, 1.5], [2, 1], [2, 2.5], [2.5, 2], [1.8, 0.9],
    [3, 3], [3, 4], [3.5, 3.5], [4, 3], [4, 4.5], [4.5, 4], [3.2, 2.8],
    [1, 4], [1.5, 3.5], [2, 4.5], [2.5, 3], [0.5, 3], [0.8, 4.2]
  ];

  // Scenario 1: Smooth scalar values (e.g., temperature, pressure)
  const scalarZValues: number[] = sampleX.map(p => (Math.sin(p[0] / 2) * Math.cos(p[1] / 2) * 10) + p[0] - p[1]);

  // Scenario 2: Integer class labels (e.g., 0, 1, 2)
  const classLabels: number[] = [
    0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2
  ];

  // Custom colorscale for 3 classes (0, 1, 2)
  // These points (0.0, 0.5, 1.0) correspond to normalized z-values.
  // If zValues are [0, 1, 2], Plotly normalizes them so 0->0.0, 1->0.5, 2->1.0.
  const classColorscale: ColorScale = [
    [0.0, 'rgba(109, 47, 47, 0.7)'],   // Class 0 - Reddish
    [0.5, 'rgba(50, 200, 50, 0.7)'],   // Class 1 - Greenish
    [1.0, 'rgba(50, 50, 220, 0.7)'],   // Class 2 - Bluish
  ];
  
  // Contour settings for distinct class boundaries
  const classContours: Partial<Contours> = {
    start: -0.5, // Start value for contour levels (class 0 is between -0.5 and 0.5)
    end: 2.5,    // End value for contour levels (assuming max class label is 2)
    size: 1,     // Step between contour levels (creates lines at -0.5, 0.5, 1.5, 2.5)
    showlines: true, 
    // `coloring: 'fill'` will be set by the `contourColoring` prop if not specified here
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      <h1>Plotly Contour Plot Examples</h1>

      <div style={{ width: 'clamp(300px, 80vw, 700px)', height: '500px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <h2>Scalar Value Contour Plot</h2>
        <PlotlyContourWrapper
          X={sampleX}
          zValues={scalarZValues}
          title="Scalar Data Visualization"
          xLabel="Feature X1"
          yLabel="Feature X2"
          colorscale="Portland" // A nice perceptually uniform colorscale
          contourColoring="fill"
          lineSmoothing={0.85} // Smoother contour lines
          ncontours={25} // More contour levels for smooth data
          connectgaps={true}
          zsmooth="best" // Smooth the underlying z-data
        />
      </div>

      <div style={{ width: 'clamp(300px, 80vw, 700px)', height: '500px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
        <h2>Class Label Contour Plot</h2>
        <PlotlyContourWrapper
          X={sampleX}
          zValues={classLabels}
          title="Class Regions Visualization"
          xLabel="Dimension 1"
          yLabel="Dimension 2"
          colorscale={classColorscale}
          contours={classContours}
          contourColoring="fill"
          showscale={true} // Show legend for class colors
          lineColor="rgba(0,0,0,0.5)" // Darker lines between class regions
          lineWidth={1}
          connectgaps={true}
        />
      </div>
    </div>
  );
};

// To run this example, you would typically render the <App /> component:
// ReactDOM.render(<App />, document.getElementById('root'));
*/
