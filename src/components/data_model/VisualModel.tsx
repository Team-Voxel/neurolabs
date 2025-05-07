// DatasetViewer.tsx

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchDataset } from "./api";
import { TableColumn, TableRow, ScatterPoint } from "./types";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";

const DatasetViewer: React.FC = () => {
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = { n_samples: 100, n_features: 2, n_informative: 2, random_state: 3 };
        const data = await fetchDataset(config);
        setColumns(data.table.columns);
        setRows(data.table.rows);
        setScatterData(data.scatter);
      } catch (err) {
        console.error("Failed to fetch dataset:", err);
      }
    };

    loadData();
  }, []);

  /* return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <div style={{ flex: 1, height: 500 }}>
        <DataGrid rows={rows} columns={columns} />
      </div>
      <div style={{ flex: 1 }}>
        <ScatterChart width={500} height={500}>
          <XAxis dataKey="x" name="UMAP-1" />
          <YAxis dataKey="y" name="UMAP-2" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="UMAP Projection" data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </div>
    </div>
    
  ); */

  const [source, setSource] = React.useState<string>('table');
    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newSource: string,
    ) => {
        setSource(newSource);
    };

    return (
        <div className="flex flex-col w-full h-full overflow-y-auto bg-white space-y-2">
            <ToggleButtonGroup
                color="primary"
                value={source}
                exclusive
                onChange={handleChange}
                aria-label="Platform"
                size="small"
                fullWidth
            >
                <ToggleButton fullWidth value={"table"} aria-label="import">Table</ToggleButton>
                <ToggleButton fullWidth value={"dist"} aria-label="generate">Distribution</ToggleButton>
                <ToggleButton fullWidth value={"corr"} aria-label="generate">Correlation</ToggleButton>
            </ToggleButtonGroup>
            {source === "table" && (
                <div style={{ flex: 1, height: 500 }}>
                    <DataGrid rows={rows} columns={columns} />
                </div>
            )}
            {source === "dist" && (
                <ResponsiveContainer width="95%" height="95%">
                <ScatterChart>
                    <XAxis dataKey="x" name="UMAP-1" />
                    <YAxis dataKey="y" name="UMAP-2" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="UMAP Projection" data={scatterData} fill="#8884d8" />
                </ScatterChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default DatasetViewer;
