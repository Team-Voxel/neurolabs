import React from "react";
import { Popover, Select, Typography } from "antd";
import { PiQuestionBold } from "react-icons/pi";
import { PlotlyHeatmap } from '../plotting/BoxHeat';
import { DFRelationship } from "../../backend_api/types";


export const RelationsModel: React.FC<{ rels: DFRelationship, cols: string[] }> = ({ rels, cols }) => {
    const [method, setMethod] = React.useState<'Spearman' | 'Pearson'>('Spearman');
    
    return (
        <div className='flex flex-col h-full w-full p-2'>
        <Popover mouseEnterDelay={1} placement='left' content={'Y-Axis: Predicted Classes and X-Axis: Actual Classes'}>
        <div style={{position: 'absolute', top: '4px', right: '4px'}} onClick={() => {}}>
            <PiQuestionBold className='w-5 h-5'/>
        </div>
        </Popover>
        <div className='flex flex-row justify-items-start items-center mb-1'>
            <Typography.Title level={4} className='m-0'>Correlation Matrix: </Typography.Title>
            <div className="w-48 ml-2">
            <Select options={[
                { label: 'Spearman', value: 'Spearman' },
                { label: 'Pearson', value: 'Pearson' }
            ]}
            value={method}
            onChange={(value) => setMethod(value as 'Spearman' | 'Pearson')}
            />
            </div>
        </div>
        <div className='flex'>
        <PlotlyHeatmap 
            z={method === 'Spearman' ? rels.correlationSpearman : rels.correlationPearson} 
            xLabels={cols} 
            yLabels={cols} 
            colorscale={'RdYlGn'} 
            margin={{ t: 80, r: 20, b: 20, l: 100, pad: 0 }}
        />
        </div>
        </div>
    );
}