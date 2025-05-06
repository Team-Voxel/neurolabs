import React, {useState, useRef, useCallback, useEffect } from 'react';
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
  type Edge, type Connection,
  XYPosition
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
import CustomSmoothStepEdge, {CustomConnectionLine} from './CustomEdges';
import useMousePosition from '../GetMousePosition';

import { layerMenuItems } from './blockLayers';
import { ContextMenu } from '../components/context_menu';
import { red } from '@mui/material/colors';
import { MenuItem } from '../components/context_menu/types';
import { FinalConnectionState } from '@xyflow/react';

const edgeTypes = {
  'custom' : CustomSmoothStepEdge,
};

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
    
    const { nodes, edges, selectedElements, onNodesChange, onEdgesChange, onConnect, addNewNode, setNodes, setEdges, deleteSelectedElements } = useStore(
        useShallow(selector),
    );
    const { screenToFlowPosition } = useReactFlow();
    const [type, setType] = useDnD();
    const [nodeIdx, setNodeIdx] = useState(0);
    const contextMenuRef = useRef<HTMLDivElement>(null);
    
    const [connectionInfo, setConnectionInfo] = useState<Connection | null>(null);
    const [isCurrentConnectionValid, setIsCurrentConnectionValid] = useState(true);
    const [mousePosCanvas, setMousePosCanvas] = useState<XYPosition>({x: 0, y: 0});
    const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
    const [connectionState, setConnectionState] = useState<FinalConnectionState>();

    const onSelectionChange = useCallback(({ nodes, edges }) => {
      useStore.getState().setSelectedElements([...nodes, ...edges]);
    }, []);

    const handleSelectItem = (item : MenuItem) => {
      console.log('Selected item:', item);
      setShowContextMenu(false);
      const position = mousePosCanvas; //screenToFlowPosition(mousePosCanvas);
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
        if (e.key === 'Delete') {
          /* const selectedIds = new Set(selectedElements.map((el) => el.id));

          setNodes(nodes.filter((n) => !selectedIds.has(n.id)));

          setEdges(
            edges.filter(
              (e) =>
                !selectedIds.has(e.id) && // if the edge itself is selected
                !selectedIds.has(e.source) && // if its source node is selected
                !selectedIds.has(e.target)    // if its target node is selected
            )
          );

          setSelectedElements([]);
          //deleteSelectedElements(); */
          console.log('Nodes deleted:', nodes.length);
          console.log('Edges deleted:', edges.length);
          deleteSelectedElements(); 
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
        addNewNode(newNode);
        setType(''); // Reset type after adding the node
      },
      [screenToFlowPosition, type]
    );

    const onConnectEnd = useCallback(
      (event, connectionState) => {
        // when a connection is dropped on the pane it's not valid
        setConnectionState(connectionState);
        if (!connectionState.isValid) {
          const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
          const pos = screenToFlowPosition({x: clientX,y: clientY,})
          //setMousePosCanvas(pos);
          setShowContextMenu(true);
          //setEdges((eds) => eds.concat({ id, source: connectionState.fromNode.id, target: id }),);
        }
      },
      [screenToFlowPosition],
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
          <div className="w-4/5 react-flow" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              onDrop={onDrop}
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