import React, {useState, useRef, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ReactFlow,
  addEdge,
  reconnectEdge,
  Controls,
  useReactFlow,
  Background,
  type Edge, type Connection,
  XYPosition
} from '@xyflow/react';

import '../../index.css'
import '@xyflow/react/dist/style.css';

import { layerMap } from './blockLayers';
import useStore from './store';
import { type AppState } from './types';
import InputNode, {OutputNode, CustomLayerNode} from './CustomNodes'
import CustomSmoothStepEdge, {CustomConnectionLine} from './CustomEdges';
import useMousePosition from '../../GetMousePosition';

import { layerMenuItems } from './blockLayers';
import { ContextMenu } from '../context_menu';
import { red } from '@mui/material/colors';
import { MenuItem } from '../context_menu/types';
import { FinalConnectionState } from '@xyflow/react';

const edgeTypes = {
  'custom' : CustomSmoothStepEdge,
};

const nodeTypes = {
  'INF': InputNode,
  'OUT': OutputNode,
  'layer': CustomLayerNode,
};

const selector = (state : AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  selectedElements: state.selectedElements,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNewNode: state.addNewNode,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  setSelectedElements: state.setSelectedElements,
  deleteSelectedElements: state.deleteSelectedElements,
});
 
const Canvas : React.FC = () => {
  
    const reactFlowWrapper = useRef(null);
    const edgeReconnectSuccessful = useRef(true);
    
    const { nodes, edges, selectedElements, onNodesChange, onEdgesChange, onConnect, addNewNode, setNodes, setEdges, setSelectedElements, deleteSelectedElements } = useStore(
        useShallow(selector),
    );
    const { screenToFlowPosition } = useReactFlow();
    const [nodeIdx, setNodeIdx] = useState(0);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    
    const [isCurrentConnectionValid, setIsCurrentConnectionValid] = useState(true);
    const [mousePosCanvas, setMousePosCanvas] = useState<XYPosition>({x: 0, y: 0});
    const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
    const [connectionState, setConnectionState] = useState<FinalConnectionState>();

    const onSelectionChange = useCallback(({ nodes, edges }) => {
      setSelectedElements([...nodes, ...edges]);
    }, []);

    const handleSelectItem = (item : MenuItem) => {
      console.log('Selected item:', item);
      setShowContextMenu(false);
      const position = mousePosCanvas;
      const id = `${nodeIdx}`;
      const newNode = {
        id: id,
        type: 'layer',
        position,
        data: {
          ...layerMap[item.id],
          label: layerMap[item.id].name,
          outputShape: '1x1',
        },
      };
      setNodeIdx(nodeIdx + 1);
      addNewNode(newNode);
      if (connectionState && !connectionState?.isValid && connectionState.fromNode) {
        setEdges((eds) => eds.concat({ id, source: connectionState.fromNode!.id, target: id }),);
      }
    }

    useEffect(() => {
      const handleClickOutside = (event: PointerEvent) => {
        if (
          contextMenuRef.current &&
          !contextMenuRef.current.contains(event.target as Node)
        ) {
          setShowContextMenu(false);
        }
      };
    
      document.addEventListener('pointerdown', handleClickOutside);
      return () => {
        document.removeEventListener('pointerdown', handleClickOutside);
      };
    }, []);

    const onMouseMove = useCallback((event) => {
      // Get the ReactFlow container's bounding rect
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      
      // Calculate mouse position relative to the container
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };
      
      if (!showContextMenu)
        setMousePosCanvas(position);

    }, [showContextMenu]);
    
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();

          deleteSelectedElements(); // delete selected elements
          
          console.log('Nodes deleted:', nodes.length);
          console.log('Edges deleted:', edges.length);
        }
  
        if (e.key === ' ') {
          e.preventDefault();
          setShowContextMenu(true);
        }

        if (e.key === 'Escape') {
          setShowContextMenu(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [screenToFlowPosition]);

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
    
    const onConnectEnd = useCallback(
      (event, connectionState) => {
        setConnectionState(connectionState);

        // when a connection is dropped on the pane it's not valid
        if (!connectionState.isValid) {
          /* const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
          const pos = screenToFlowPosition({x: clientX,y: clientY,}) */

          setShowContextMenu(true);
        }
      },
      [screenToFlowPosition],
    );

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
          <div className="w-full react-flow" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              onDragOver={onDragOver}
              onReconnect={onReconnect}
              onReconnectStart={onReconnectStart}
              onReconnectEnd={onReconnectEnd}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              isValidConnection={isValidConnection}
              connectionLineComponent={CustomConnectionLine}
              onConnectEnd={onConnectEnd}
              defaultEdgeOptions={{animated: true, type: 'custom', interactionWidth: 50, style: {strokeWidth: 3, stroke: red[500]}}}
              onMouseMove={onMouseMove}
              fitView
            >
              <Controls />
              <Background />
              {showContextMenu && 
              (<div
                ref={contextMenuRef}
                style={{
                  position: 'absolute',
                  left: `${mousePosCanvas.x}px`,
                  top: `${mousePosCanvas.y}px`,
                  zIndex: 10,
                  background: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  pointerEvents: 'all'
                }}
              >
                <ContextMenu items={layerMenuItems} onItemClick={handleSelectItem}></ContextMenu>
              </div>)}
            </ReactFlow>
          </div>
        </div>
        </div>
      </>
  );
}
 
export default Canvas;