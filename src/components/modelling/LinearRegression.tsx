import React, {useState} from "react";
import { Typography } from "antd";
import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const CustomNode = (props) => {
    const { x, y, width, height, index, payload } = props;
    const dist = x + (index === 0 ? - width - 30 : width + 6) ;
    return (
      <g>
        <rect
          x={x}
          y={y}
          height={height}
          width={width}
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth={1}
        />
        <text
          x={dist}
          y={y + height / 2}
          dy="0.35em"
          textAnchor="start"
          fill="#333"
          fontSize={14}
          fontStyle={"bold"}
        >
            {payload.name}
        </text>
      </g>
    );
};

export const LinearRegression: React.FC = () => {
    const [linConn, setLinConn] = useState(
    {
        nodes:[{name: "Target"}, {name: "X1"}, {name: "X2"}, {name: "X3"}, {name: "X4"}, {name: "X5"}],
        links:
        [
            { source: 1, target: 0, value: .1 },
            { source: 2, target: 0, value: .1 },
            { source: 3, target: 0, value: 0.5 },
            { source: 4, target: 0, value: 0.2 },
            { source: 5, target: 0, value: .1 },
        ],
    }
    );
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-row w-full h-full">
                <div className="flex-1 w-1/3 border px-4">
                    <ResponsiveContainer width="100%" height="100%">
                    <Sankey
                        data={linConn}
                        nodePadding={50}
                        node={CustomNode}
                        link={{ stroke: '#77c878' }}
                        >
                        <Tooltip/>
                    </Sankey>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col w-2/3 p-4">
                <Typography.Title level={2}>Linear Regression</Typography.Title>
                    <BlockMath math="y= \sum_{i}^{n} W_ix_i + b" />
                </div>
            </div>
        </div>
    );
}