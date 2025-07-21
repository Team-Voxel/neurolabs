import React, { useRef, useState } from 'react';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import { NetworkLayersProps, DragItem, ActiveNetworkElement } from './types';
import { ItemTypes } from './ItemTypes';
import { Layers } from 'lucide-react';

type IdCountMap = {
  [key: string]: Set<number>;
};

const NetworkLayers: React.FC<NetworkLayersProps> = ({ 
  layers, 
  allElements, 
  onLayersChange, 
  onElementSelect,
  selectedElementId 
}) => {

  const [idSet, setIdSet] = useState<IdCountMap>(() => {
    const initialIdSet: IdCountMap = {};
    
    allElements.forEach((element) => {
      initialIdSet[element.id] = new Set<number>([0,1,2,3,4,5,6,7,8,9]);
    });
    
    return initialIdSet;
  });


  const getID = (id: string): number | undefined => {
    const set = idSet[id];
    if (!set || set.size === 0) {
      throw new Error(`No available IDs for element type: ${id}`);
    }
    
    // Get the first number from the set
    const iterator = set.values();
    const number = iterator.next().value;
    
    // Remove the number from the set
    setIdSet((prevState) => {
      const newSet = new Set(prevState[id]);
      newSet.delete(number? number : 0);
      return {
        ...prevState,
        [id]: newSet
      };
    });
    
    return number;
  };

  const returnID = (id: string, number: number): void => {
    setIdSet((prevState) => {
      const newSet = new Set(prevState[id]);
      newSet.add(number);
      return {
        ...prevState,
        [id]: newSet
      };
    });
  };

  // Get elements that are in layers
  const layerElements = layers.map(activeNetworkEl => 
    allElements.find(element => element.id === activeNetworkEl.type)
  ).filter(Boolean);

  // Handle element drop
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.NETWORK_ITEM, ItemTypes.LAYER_ITEM],
    drop: (item: DragItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (didDrop) {
        return;
      }

      // If item is from toolbar, add it to layers
      if (item.type === ItemTypes.NETWORK_ITEM) {
        const newItem : ActiveNetworkElement = {
          type: item.id,
          id: getID(item.id)!,
        }
        const newLayers = [...layers, newItem];
        onLayersChange(newLayers);
        /* if (!layers.includes(item.id)) {
        } */
      }
      return undefined;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }), [layers, onLayersChange]);

  // Handle reordering
  const moveLayer = (dragIndex: number, hoverIndex: number) => {
    const newLayers = [...layers];
    const [movedItem] = newLayers.splice(dragIndex, 1);
    newLayers.splice(hoverIndex, 0, movedItem);
    onLayersChange(newLayers);
  };

  // Create ref for layer items
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleRemoveLayer = (index: number) => {
    layers.forEach((layer, layer_index) => {
      if (layer_index === index) {
        returnID(layer.type, layer.id);
        console.log(idSet);
      }
    });
    const newLayers = layers.filter((_layerId, layer_index) => layer_index !== index);
    onLayersChange(newLayers);
  };

  return (
    <div 
      ref={drop}
      className={`
        flex-grow 
        flex 
        flex-col 
        items-center 
        justify-center 
        min-h-[300px]
        w-full 
        p-6
        transition-all 
        duration-200 
        ${isOver && canDrop ? 'bg-blue-50' : 'bg-white'} 
        ${layers.length === 0 ? 'border-2 border-dashed border-gray-200' : ''}
      `}
      style={{ order: 1 }}
    >
      {layers.length === 0 ? (
        <div className="flex flex-row items-center justify-center text-gray-400">
          <Layers size={48} className="mb-2" />
          <p className="text-sm">Drag network elements here to add layers</p>
        </div>
      ) : (
        <div className="flex flex-row space-x-2">
          {layerElements.map((element, index) => element && (
            <LayerItem
              key={index}
              id={element.id}
              index={index}
              element={element}
              isSelected={selectedElementId === index}
              onSelect={() => onElementSelect(index)}
              onRemove={() => handleRemoveLayer(index)}
              moveLayer={moveLayer}
              ref={(el) => layerRefs.current[element.id] = el}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface LayerItemProps {
  id: string;
  index: number;
  element: any;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  moveLayer: (dragIndex: number, hoverIndex: number) => void;
}

const LayerItem = React.forwardRef<HTMLDivElement, LayerItemProps>(
  ({ id, index, element, isSelected, onSelect, onRemove, moveLayer }, ref) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.LAYER_ITEM,
      item: { id, index, type: ItemTypes.LAYER_ITEM },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }), [id, index]);

    const [, drop] = useDrop(() => ({
      accept: ItemTypes.LAYER_ITEM,
      hover: (item: DragItem, _monitor) => {
        if (!ref) return;
        const dragIndex = item.index;
        const hoverIndex = index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        if (typeof dragIndex !== 'number' || typeof hoverIndex !== 'number') {
          return;
        }

        // Move the element
        moveLayer(dragIndex, hoverIndex);
        
        // Note: we're mutating the item here to avoid expensive index searches
        item.index = hoverIndex;
      },
    }), [index, moveLayer]);

    return (
      <div
        ref={(node) => {
          drag(drop(node));
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={`
          flex 
          flex-col
          items-center 
          p-3 
          bg-white 
          border 
          rounded-lg 
          shadow-sm
          transition-all 
          duration-200
          ${isDragging ? 'opacity-50' : 'opacity-100'}
          ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
        `}
        onClick={onSelect}
      >
        <div className="flex items-center space-y-3 flex-grow">
          <div className="w-8 h-8 overflow-hidden">
            <img 
              src={element.imageUrl} 
              alt={element.name} 
              className="object-contain w-full h-full" 
            />
          </div>
          <span className="font-medium text-gray-700">{element.name}</span>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
        >
          <div className="bg-red h-5 w-5"></div>
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg> */}
        </div>
      </div>
    );
  }
);

export default NetworkLayers;