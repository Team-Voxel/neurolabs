import React, { useEffect, useRef, useCallback } from 'react';
import Plotly from 'plotly.js-dist-min';

export interface PlotProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  onPlotClick?: (event: Plotly.PlotMouseEvent) => void;
  onPlotHover?: (event: Plotly.PlotMouseEvent) => void;
  onPlotSelect?: (event: Plotly.PlotSelectionEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Plot: React.FC<PlotProps> = ({
  data,
  layout = {},
  config = { responsive: true },
  onPlotClick,
  onPlotHover,
  onPlotSelect,
  className = '',
  style = {},
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const createPlot = useCallback(() => {
    if (!plotRef.current) return;

    const defaultLayout: Partial<Plotly.Layout> = {
      margin: { t: 20, r: 20, b: 40, l: 40 },
      autosize: true,
      ...layout,
    };

    Plotly.newPlot(
      plotRef.current,
      data,
      defaultLayout,
      config
    ).then(() => {
      if (!plotRef.current) return;

      /* if (onPlotClick) {
        plotRef.current.on(onPlotClick);
      }
      if (onPlotHover) {
        plotRef.current.on('plotly_hover', onPlotHover);
      }
      if (onPlotSelect) {
        plotRef.current.on('plotly_selected', onPlotSelect);
      } */
    });
  }, [data, layout, config, onPlotClick, onPlotHover, onPlotSelect]);

  const updatePlot = useCallback(() => {
    if (!plotRef.current) return;

    Plotly.react(
      plotRef.current,
      data,
      layout,
      config
    );
  }, [data, layout, config]);

  useEffect(() => {
    createPlot();

    resizeObserverRef.current = new ResizeObserver(() => {
      if (plotRef.current) {
        Plotly.Plots.resize(plotRef.current);
      }
    });

    if (plotRef.current) {
      resizeObserverRef.current.observe(plotRef.current);
    }

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [createPlot]);

  useEffect(() => {
    updatePlot();
  }, [data, layout, config, updatePlot]);

  return (
    <div
      ref={plotRef}
      className={`w-full h-full ${className}`}
      style={style}
    />
  );
};

export default Plot;