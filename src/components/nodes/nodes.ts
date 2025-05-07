import { type AppNode } from './types';




export const initialNodes = [
    {
      id: '-1',
      type: 'INF',
      position: { x: 0, y: 100 },
      data: { label: 'INF', layer_id: '-1', layer_type: 'INF' },
      deletable: false,
    },
    {
      id: '-2',
      type: 'OUT',
      position: { x: 150, y: 100 },
      data: { label: 'OUT', layer_id: '-2', layer_type: 'OUT' },
      deletable: false,
    },
] as AppNode[];
