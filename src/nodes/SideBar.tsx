import React from 'react';
import { layerTypes } from './blockLayers'; // adjust the import path as needed

type SidebarProps = {
  dragFunction: (layerId: string) => React.DragEventHandler<HTMLDivElement>;
};

const layerColors: Record<string, string> = {
  DNN: '#cbd5e1',      // light gray-blue
  CNN: '#fca5a5',      // light red
  RNN: '#fdba74',      // orange
  Transformer: '#93c5fd', // sky blue
  // Add other layer types here
};

const Sidebar: React.FC<SidebarProps> = ({ dragFunction }) => {
  return (
    <aside className="w-64 p-4 bg-white border-r border-gray-200 overflow-y-auto h-full shadow">
      <h2 className="text-lg font-semibold mb-4">Layers</h2>
      <div className="flex flex-col gap-2">
        {layerTypes.map((node) => (
          <div
            key={node.layer_id}
            draggable
            onDragStart={dragFunction(node.layer_id)}
            className="cursor-move rounded-lg px-3 py-2 shadow-sm border border-gray-300 transition hover:shadow-md"
            style={{
              backgroundColor: layerColors[node.layer_type] || '#e2e8f0', // fallback color
            }}
          >
            <div className="font-medium">{node.name}</div>
            <div className="text-xs text-gray-700">{node.description}</div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;