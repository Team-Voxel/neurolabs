import {
    type Edge,
    type Node,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
  } from '@xyflow/react';

  import { type LayerDefinition } from './blockLayers';

  export type LayerNodeData = {
    label: string;
    outputShape: string;
  } & LayerDefinition;

  export type AppNode = Node<LayerNodeData>;
  
  export type AppState = {
    nodes: AppNode[];
    edges: Edge[];
    onNodesChange: OnNodesChange<AppNode>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: AppNode[]) => void;
    setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
    addNewNode: (newNode: AppNode) => void;
    selectedElements: (Node | Edge)[];
    setSelectedElements: (elements: (Node | Edge)[]) => void;
    deleteSelectedElements: () => void;
  };
  