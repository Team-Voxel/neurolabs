import React from "react";
import { Popover } from "antd";
import { PiQuestionBold } from "react-icons/pi";
import { PlotlyHeatmap } from '../plotting/BoxHeat';
import { DFRelationship } from "../../backend_api/types";


export const RelationsModel: React.FC<{ rels: DFRelationship, cols: string[] }> = ({ rels, cols }) => {

    return (
        <div className='h-full w-full p-2'>
        <Popover mouseEnterDelay={1} placement='left' content='Y-Axis: Predicted Classes and X-Axis: Actual Classes'>
        <div style={{position: 'absolute', top: '4px', right: '4px'}} onClick={() => {}}>
            <PiQuestionBold className='w-5 h-5'/>
        </div>
        </Popover>
        <PlotlyHeatmap z={rels.correlationSpearman} xLabels={cols} yLabels={cols} colorscale={'RdYlGn'}/>
        </div>
    );
}