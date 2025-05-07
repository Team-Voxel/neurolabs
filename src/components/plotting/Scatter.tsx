import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface ScatterPlotProps {
  data: { x1: number; x2: number; y: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {

    return (
        <ScatterChart
            width={400}
            height={400}
            margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
            }}
        >
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="stature" unit="cm" />
            <YAxis type="number" dataKey="y" name="weight" unit="kg" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="A school" data={data} fill="#8884d8">
            {data.map((entry, index) => (
                <Cell key={`cell-${entry.y}`} fill={COLORS[entry.y % COLORS.length]} />
            ))}
            </Scatter>
        </ScatterChart>
    
    );
}