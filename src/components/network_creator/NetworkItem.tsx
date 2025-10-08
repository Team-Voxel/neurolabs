import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { NetworkItemProps } from './types';
import { ItemTypes } from './ItemTypes';

const NetworkItem: React.FC<NetworkItemProps> = ({ 
  item, 
  isSelected = false, 
  onClick, 
  isDraggable = true,
  index
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeout = useRef<number | null>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: isDraggable ? ItemTypes.NETWORK_ITEM : ItemTypes.LAYER_ITEM,
    item: () => {
      return { 
        id: item.id, 
        type: isDraggable ? ItemTypes.NETWORK_ITEM : ItemTypes.LAYER_ITEM,
        index 
      };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isDraggable,
  }), [item.id, isDraggable, index]);

  const handleMouseEnter = () => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    tooltipTimeout.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  return (
    <div 
      ref={drag}
      className={`
        relative 
        flex 
        flex-col 
        items-center 
        justify-center 
        w-24 
        h-24 
        p-2 
        m-2 
        bg-white 
        rounded-lg 
        cursor-pointer 
        transition-all 
        duration-200
        ${isDragging ? 'opacity-100' : 'opacity-100'}
        ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-sm hover:shadow-md border border-gray-200'}
      `}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transform: isDragging ? 'scale(1.05)' : 'scale(1)' }}
    >
      <div className="w-12 h-12 mb-2 overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="object-contain w-full h-full" 
        />
      </div>
      <span className="text-xs font-medium text-center text-gray-700 truncate w-full">
        {item.name}
      </span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div 
          className={`absolute p-2 z-${index? 50 - index : 10} text-xs text-white bg-gray-800 rounded shadow-lg w-max max-w-xs`}
          style={{
            transform: 'translateX(0%) translateY(0%)',
          }}
        >
          <div 
            className="absolute w-2 h-2 bg-gray-800 rotate-45"
            style={{
              bottom: '-4px',
              left: 'calc(50% - 4px)',
            }}
          />
            {item.tooltipContent}
          </div>
      )}
    </div>
  );
};

export default NetworkItem;