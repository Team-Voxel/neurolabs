// Data Analysis Pipeline (DAP) Node
import React, {useState} from 'react';
import { type Node, type NodeProps, Handle, Position } from '@xyflow/react';
import { Hand } from 'lucide-react';
import { 
  SortableContainer, 
  SortableItem, 
  DragHandle, 
  NestedSortableItem 
} from '../components/dnd';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { type LayerDefinition } from './blockLayers';
import { red } from '@mui/material/colors';
 
type InOutNode = Node<{
    count : number,
    label : string,
    description : string
}, 'number'>;

export default function GeneralInputNode({ data }: NodeProps<InOutNode>) {
  return (
    <div className="rounded-lg border shadow-md bg-white">
      <div className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-t-lg">
        {data.label}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-gray-700" />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-600 border-2 border-white rounded-sm shadow"
      />
      </div>
      <div className="p-3 text-sm text-gray-700">
        {data.description}
      </div>

    </div>
  );
}

export function GeneralOutputNode({data} : NodeProps<InOutNode>) {
  return (
    <div className=" bg-gray-100 rounded-md shadow-md px-4 py-2 border relative">
      {/* Left Handle - Input */}
      <Handle
        type="target"
        position={Position.Left}
        className="customHandle"
        isConnectable={true}
      />

      {/* Node Content */}
      <div className="flex items-center justify-center h-full min-h-[60px] p-2"> 
        <p className="text-sm font-medium">Test</p>
      </div>

      {/* Right Handle - Output */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, borderRadius: 0, height: '100%', color: 'green' }}
        className="bg-green-500 absolute h-full"
        isConnectable={true}
      />
    </div>
  );
}


const initialItems = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];
const itemContent = {
  'item-1': 'Marketing Campaign',
  'item-2': 'Website Redesign',
  'item-3': 'Mobile App Development',
  'item-4': 'Content Strategy',
  'item-5': 'Product Launch'
};

export function GeneralNode({data} : NodeProps<InOutNode>) {  
  const [items, setItems] = useState(initialItems);


  return (
    <ErrorBoundary>
      {(
        <SortableContainer
          items={items}
          onItemsChange={setItems}
          direction='horizontal'
          className="w-full"
          containerClassName='flex-wrap gap-4'
          onDragStart={(id) => console.log('Drag started:', id)}
          onDragEnd={(id) => console.log('Drag ended:', id)}
          isLoading={false}
        >
          {items.map((id) => (
            <SortableItem 
              key={id} 
              id={id}
              className={'w-[calc(33.333%-1rem)] sm:w-[calc(25%-1rem)]'}
            >
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{itemContent[id as keyof typeof itemContent]}</span>
                </div>
              </div>
            </SortableItem>
          ))}
        </SortableContainer>
      )}
    </ErrorBoundary>
  );
}

type NodeData = Node<{
  name: string,
  config: string[]
}, 'data'>;

export function CustomNode({ data }: NodeProps<NodeData>) {

  const [outXDim, setOutXDim] = useState(0);
  const [outYDim, setOutYDim] = useState(0);

  return (
    <>
      <div className='flex flex-col gap-0 rounded'>
        <div className='flex flex-row gap-2 justify-between p-2'>
        {data.name}
        </div>
        {/* <div>
          {data.config.map((item, index) => (
            <>
            
            </>
          ))}
        </div> */}
        <Handle type="target" position={Position.Top} className="w-2 h-2 bg-gray-700" />
        <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-gray-700" />
      </div>
    </>
  );
}

export function CircularNode({ data }) {
  return (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: '50%',
      backgroundColor: 'red',
      position: 'relative',
    }}>
      {/* Left Arc */}
      <svg
        width="30"
        height="100"
        style={{ position: 'absolute', top: 0, left: -15, zIndex: 2 }}
        viewBox="0 0 30 100"
      >
        <path
          d="M 25,0 A 40,50 0 0,1 25,100"
          stroke="black"
          strokeWidth="4"
          fill="none"
        />
      </svg>

      {/* Right Arc */}
      <svg
        width="30"
        height="100"
        style={{ position: 'absolute', top: 0, right: -15, zIndex: 2 }}
        viewBox="0 0 30 100"
      >
        <path
          d="M 5,0 A 40,50 0 0,0 5,100"
          stroke="black"
          strokeWidth="4"
          fill="none"
        />
      </svg>

      {/* Invisible Handles for interaction */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
          left: -10,
          top: '50%',
          width: 20,
          height: 20,
          transform: 'translateY(-50%)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          opacity: 0,
          right: -10,
          top: '50%',
          width: 20,
          height: 20,
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
}

import DynamicForm from '../components/DynamicForm';

type LayerNodeData = Node<LayerDefinition, 'data'>;

const layerColors: Record<string, string> = {
  DNN: '#cbd5e1',
  CNN: '#fca5a5',
  RNN: '#fdba74',
  Transformer: '#93c5fd',
  // Add more as needed
};
// ${selected ? 'ring-2 ring-blue-400' : ''}
// Add this to the top div to create a border when selected
export const CustomLayerNode: React.FC<NodeProps<LayerNodeData>> = ({ data, selected }) => {
  const color = layerColors[data.layer_type] || '#e2e8f0';

  return (
    <div
      className={`rounded-[5px] p-0 text-sm shadow-md border-2 flex flex-col gap-2`}
      style={{
        backgroundColor: selected ? color : '#fca5a5', // Use better colors
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

      <DynamicForm layer={data} onChange={(values) => console.log(values)}></DynamicForm>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};