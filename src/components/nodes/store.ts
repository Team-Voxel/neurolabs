import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

import { initialNodes } from './nodes';
import { initialEdges } from './edges';
import { type AppState , type AppNode} from './types';

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedElements: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes: typeof initialNodes) => {
    set({ nodes });
  },
  setEdges: (edgesOrUpdater) => {
    set((state) => ({
      edges: typeof edgesOrUpdater === 'function'
        ? edgesOrUpdater(state.edges)
        : edgesOrUpdater,
    }));
  },
  addNewNode: (newNode: AppNode) => {
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },
  setSelectedElements: (elements) => {
    set({ selectedElements: elements });
  },
  deleteSelectedElements: () => {
    set((state) => {
      const undeletableIds = new Set(['-1', '-2']);
      const selectedIds = new Set(
        state.selectedElements.map((el) => el.id).filter((id) => !undeletableIds.has(id))
      );
      return {
        nodes: state.nodes.filter((n) => !selectedIds.has(n.id)),
        edges: state.edges.filter(
          (e) =>
            !selectedIds.has(e.id) &&
            !selectedIds.has(e.source) &&
            !selectedIds.has(e.target)
        ),
        selectedElements: [],
      };
    });
  },
}));

export default useStore;
