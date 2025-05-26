import React, {useState} from "react";
import {VisualModel} from "./VisualModel";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Table } from "antd";

export const DataModel: React.FC = () => {
    const [source, setSource] = React.useState<string>('generate');
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
                <ToggleButton fullWidth value={"ov"} aria-label="import">Overview</ToggleButton>
                <ToggleButton fullWidth value={"dist"} aria-label="generate">Distributions</ToggleButton>
                <ToggleButton fullWidth value={"rels"} aria-label="import">Relationships</ToggleButton>
                <ToggleButton fullWidth value={"visual"} aria-label="import">Visualize</ToggleButton>
            </ToggleButtonGroup>
            {source === "ov" && (
                <DFOverviewModel />
            )}
            {source === "dist" && (
                <DistributionModel />
            )}
            {source === "rels" && (
                <RelationsModel />
            )}
            {source === "visual" && (
                <VisualModel />
            )}
        </div>
    );
}
