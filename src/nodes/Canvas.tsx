import React, {useState, useRef, useCallback, DragEventHandler } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  reconnectEdge,
  Controls,
  useReactFlow,
  Background,
  type Edge, type Connection
} from '@xyflow/react';

import '../index.css'
import '@xyflow/react/dist/style.css';
import { DnDProvider, useDnD } from './dndContext';
import SideBar from './SideBar';

import {layerTypes} from './blockLayers'
import { layerMap } from './blockLayers';
import useStore from './store';
import { type AppState } from './types';
import GeneralInputNode, {GeneralOutputNode, GeneralNode, CustomNode, CustomLayerNode, CircularNode} from './CustomNodes'
import { Console } from 'console';
import { red } from '@mui/material/colors';

const nodeTypes = {
  'inputNode': GeneralInputNode,
  'outputNode': GeneralOutputNode,
  'general': GeneralNode,
  'custom': CustomNode,
  'layer': CustomLayerNode,
  'circular': CircularNode,
};

const selector = (state : AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNewNode: state.addNewNode,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});
 
const Canvas : React.FC = () => {
  
    const reactFlowWrapper = useRef(null);
    const edgeReconnectSuccessful = useRef(true);
    
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNewNode, setNodes, setEdges } = useStore(
        useShallow(selector),
    );
    const { screenToFlowPosition } = useReactFlow();
    const [type, setType] = useDnD();
    const [nodeIdx, setNodeIdx] = useState(0);

    const [connectionInfo, setConnectionInfo] = useState<Connection | null>(null);
    const [isCurrentConnectionValid, setIsCurrentConnectionValid] = useState(true);

    const onConnectValidate = useCallback((connection: Connection) => {
      if (isValidConnection(connection)) {
        setEdges((eds) => addEdge(connection, eds));
      } else {
        console.log("Error");
      }
    }, []);

    const onReconnectStart = useCallback(() => {
      console.log('onReconnect', edges);
      edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback(
      (oldEdge, newConnection) =>{
        edgeReconnectSuccessful.current = true;
        setEdges((prevEdges) => reconnectEdge(oldEdge, newConnection, prevEdges));
        console.log('onReconnect', edges);
      },  
      [],
    );
    
    const onReconnectEnd = useCallback((_, edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges(edges.filter((e) => e.id !== edge.id));
        console.log('disconnected', edges);
      }
   
      edgeReconnectSuccessful.current = true;
    }, [edges, setEdges]);
    
    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
      (event) => {
        event.preventDefault();
        
        console.log('Called on drop', type)

        if (!type) return;
    
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        let name: string = 'Unknown Layer';
        let block_type : any;
        layerTypes.forEach((layer) => {
          if (layer.layer_id === type) {
            name = layer.name;
            block_type = layer;
          }
        });

        const layerInfo = layerMap[type];
        if (!layerInfo) return;
    
        const newNode = {
          id: `${nodeIdx}`,
          type: 'layer',
          position,
          data: {
            ...layerInfo,
            label: layerInfo.name,
            outputShape: '1x1',
          },
        };

        setNodeIdx(nodeIdx + 1);
        console.log('New node added:', newNode);
        addNewNode(newNode);
        setType(''); // Reset type after adding the node
        console.log('edges', edges);
      },
      [screenToFlowPosition, type]
    );

    const onDragStart = (nodeType: string): React.DragEventHandler<HTMLDivElement> => {
      return (event) => {
        setType(nodeType);
        event.dataTransfer.setData('text/plain', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      };
    };
    
  function isValidConnection(edge: Edge | Connection) : any {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return false;
    if (sourceNode == targetNode) return false; // recursion not allowed
    const source_type = sourceNode.data.layer_type;
    const target_type = targetNode.data.layer_type;

    if(targetNode.data.compatible.find(t => t == source_type)) return true;
    
    return false;
  }

    return (
      <>
      <div className='flex flex-col w-full h-full'>

        <div className='node-box h-1/20'>
          fa
        </div>
        <div className='flex flex-row h-19/20'>
          <div className='w-1/4 bg-white border-r border-gray-200'>
            <SideBar dragFunction={onDragStart} />
          </div>
          <div className="w-4/5" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onReconnect={onReconnect}
              onReconnectStart={onReconnectStart}
              onReconnectEnd={onReconnectEnd}
              nodeTypes={nodeTypes}
              isValidConnection={isValidConnection}
              defaultEdgeOptions={{animated: true, type: 'smoothstep', interactionWidth: 50, style: {strokeWidth: 3, stroke: red[500]}}}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
        </div>
      </>
  );
}
 
export default Canvas;