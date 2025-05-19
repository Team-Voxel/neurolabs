import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NetworkCreator from '../network_creator/NetworkCreator';
import { DraggableItem, ActiveNetworkElement} from '../network_creator/types';
import { Network, Server, Database, Globe, Cpu, Laptop, HardDrive, Wifi } from 'lucide-react';

// Sample network elements
const networkElements: DraggableItem[] = [
  {
    id: 'dense',
    name: 'Dense',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/5023/5023309.png',
    tooltipContent: 'A fully connected network layer where each neuron is connected to every neuron in the previous layer.'
  },
  {
    id: 'conv',
    name: 'Convolutional',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1156/1156691.png',
    tooltipContent: 'A layer that applies convolutional filters to the input data, commonly used in image processing.'
  },
  {
    id: 'pool',
    name: 'Pooling',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/6813/6813043.png',
    tooltipContent: 'A layer that reduces the spatial dimensions of the input data, typically used after convolutional layers.'
  },
  {
    id: 'drop',
    name: 'Dropout',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1792/1792525.png',
    tooltipContent: 'A regularization technique that randomly sets a fraction of the input units to 0 during training.'
  },
  {
    id: 'flatten',
    name: 'Flatten',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
    tooltipContent: 'A layer that flattens the input data into a 1D array, typically used before fully connected layers.'
  },
  {
    id: 'bnorm',
    name: 'Batch Norm',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2147/2147586.png',
    tooltipContent: 'A layer that normalizes the input data to improve training speed and stability.'
  }
];


export const NNModel: React.FC = () => {

  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [layers, setLayers] = useState<ActiveNetworkElement[]>([]);

  const handleElementSelect = (elementId: number) => {
    setSelectedElement(elementId);
    console.log('Selected element:', elementId);
  };

  const handleLayersChange = (newLayers: ActiveNetworkElement[]) => {
    setLayers(newLayers);
    console.log('Layers changed:', newLayers);
  };

  return (
    <div className='flex flex-row w-full h-full'>
    <NetworkCreator
              toolbarPosition='bottom'
              elements={networkElements}
              onElementSelect={handleElementSelect}
              onLayersChange={handleLayersChange}
              
            />
      <div className='flex flex-col w-1/4 h-full p-4'>
        fa
      </div>
   </div>
  );
}