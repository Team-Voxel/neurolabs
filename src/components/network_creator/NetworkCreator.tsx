import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NetworkCreatorProps } from './types';
import NetworkToolbar from './NetworkToolbar';
import NetworkLayers from './NetworkLayers.tsx';
import NetworkErrorBoundary from './NetworkErrorBoundary';

const NetworkCreator: React.FC<NetworkCreatorProps> = ({ 
  toolbarPosition, 
  elements, 
  onElementSelect, 
  onLayersChange 
}) => {
  const [layers, setLayers] = useState<string[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null);

  const handleElementSelect = (elementId: number) => {
    setSelectedElementId(elementId);
    onElementSelect(elementId);
  };

  const handleLayersChange = (newLayers: string[]) => {
    setLayers(newLayers);
    onLayersChange(newLayers);
  };

  return (
    <NetworkErrorBoundary>
      <DndProvider backend={HTML5Backend} context={window}>
        <div className="flex flex-col w-full h-full border border-gray-200 rounded-lg bg-white overflow-hidden">
          <NetworkToolbar 
            position={toolbarPosition} 
            elements={elements} 
            onElementSelect={handleElementSelect} 
          />
          <NetworkLayers 
            layers={layers} 
            allElements={elements} 
            onLayersChange={handleLayersChange} 
            onElementSelect={handleElementSelect}
            selectedElementId={selectedElementId}
          />
        </div>
      </DndProvider>
    </NetworkErrorBoundary>
  );
};

export default NetworkCreator;