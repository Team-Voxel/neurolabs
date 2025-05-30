import React, {useState, useEffect} from "react";
import {VisualModel} from "./VisualModel";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { DFOverviewModel } from "./DFOverviewModel";
import { DistributionModel } from "./DistributionModel";
import { RelationsModel } from "./RelationsModel";
import type { EDAData, DFRelationship, DFStats } from "../../backend_api/types";
import { useWorkflowStore } from "../../AppState";


export const DataModel: React.FC = () => {
    const [source, setSource] = useState<string>('generate');
    const [overview, setOverview] = useState<string>('overview');
    const [features, setFeatures] = useState<number>(1);
    const [problem, setProblem] = useState<'regress' | 'classify'>('regress');
    const [data, setData] = useState<EDAData | null>(null);

    // Use the hook to subscribe to state changes
    const wfStore = useWorkflowStore();

    useEffect(() => {
        const workflow = wfStore.current;
        if (workflow) {
            window.wfStore.getPCDFile(workflow.name).then((pcd) => {
                setData(pcd);
            });
        }
    }, []);

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
                <DistributionModel data={data!.distributions} />
            )}
            {source === "rels" && (
                <RelationsModel />
            )}
            {source === "visual" && (
                <VisualModel problem={problem} features={features} />
            )}
        </div>
    );
}
