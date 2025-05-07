
import React, {useState} from 'react';
import { type Node, type NodeProps, Handle, Position } from '@xyflow/react';
import { type LayerDefinition } from './blockLayers';
import DynamicForm from '../dynamic_form/DynamicForm';

type LayerNodeData = Node<LayerDefinition, 'data'>;

const layerColors: Record<string, string> = {
  DNN: '#cbd5e1',
  Input: '#fca5a5',
  Classical: '#fdba74',
  OUT: '#93c5fd',
  INF: '#a5b4fc',
  SelectedNodeColor: '#fca5a5',
};

export default function InputNode({ data, selected }: NodeProps<LayerNodeData>) {
  const color = layerColors[data.layer_type] || '#e2e8f0';

  return (
    <>
    <Handle type="source" position={Position.Right} style={{transform: 'translate(50%, -50%)', height: '20px', width: '12px', borderRadius: '10px', opacity: '1', border: '2px solid', background:'Transparent'}} />
    <div
      className={`rounded-[5px] p-0 text-sm shadow-md border-2 flex flex-col gap-2`}
      style={{
        backgroundColor: selected ? layerColors['SelectedNodeColor'] : color, // Use better colors
        borderColor: '#94a3b8',
        minWidth: 120,
        maxWidth: 180,
        minHeight: 150,
        textAlign: 'center',
      }}
    >
      <div className='rounded-tr-[3px] rounded-tl-[3px] h-1/5 w-full' style={{
        backgroundColor: '#ff0000',

      }}>
        <div className="font-medium">Input Features</div>
      </div>

    </div>
    </>
  );
}

export function OutputNode({data, selected} : NodeProps<LayerNodeData>) {
  const color = layerColors[data.layer_type] || '#e2e8f0';

  return (
    <>
    <Handle type="target" position={Position.Left} style={{transform: 'translate(-50%, -50%)', height: '20px', width: '12px', borderRadius: '10px', opacity: '1', border: '2px solid', background:'Transparent'}} />
    <div
      className={`rounded-[5px] p-0 text-sm shadow-md border-2 flex flex-col gap-2`}
      style={{
        backgroundColor: selected ? layerColors['SelectedNodeColor'] : color, // Use better colors
        borderColor: '#94a3b8',
        minWidth: 120,
        maxWidth: 180,
        minHeight: 150,
        textAlign: 'center',
      }}
    >
      <div className='rounded-tr-[3px] rounded-tl-[3px] h-1/5 w-full' style={{
        backgroundColor: '#ff0000',

      }}>
        <div className="font-medium">Model Output</div>
      </div>

    </div>
    </>
  );
}

// ${selected ? 'ring-2 ring-blue-400' : ''}
// Add this to the top div to create a border when selected
export const CustomLayerNode: React.FC<NodeProps<LayerNodeData>> = ({ data, selected }) => {
  const color = layerColors[data.layer_type] || '#e2e8f0';

  return (
    <>
    <Handle type="target" position={Position.Left} style={{transform: 'translate(-50%, -50%)', height: '20px', width: '12px', borderRadius: '10px', opacity: '1', border: '2px solid', background:'Transparent'}} />
    <Handle type="source" position={Position.Right} style={{transform: 'translate(50%, -50%)', height: '20px', width: '12px', borderRadius: '10px', opacity: '1', border: '2px solid', background:'Transparent'}} />
    <div
      className={`rounded-[5px] p-0 text-sm shadow-md border-2 flex flex-col gap-2`}
      style={{
        backgroundColor: selected ? layerColors['SelectedNodeColor'] : color, // Use better colors
        borderColor: '#94a3b8',
        minWidth: 120,
        maxWidth: 180,
        minHeight: 150,
        textAlign: 'center',
      }}
    >
      <div className='rounded-tr-[3px] rounded-tl-[3px] h-1/5 w-full' style={{
        backgroundColor: '#ff0000',

      }}>
        <div className="font-medium">{data.name}</div>
      </div>

      <DynamicForm controls={data.controls!} onChange={(values) => console.log(values)}></DynamicForm>

    </div>
    </>
  );
};