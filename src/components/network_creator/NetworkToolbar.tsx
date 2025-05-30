import React from 'react';
import { NetworkToolbarProps } from './types';
import NetworkItem from './NetworkItem';

const NetworkToolbar: React.FC<NetworkToolbarProps> = ({ 
  position, 
  elements, 
  onElementSelect 
}) => {
  return (
    <div 
      className={`
        flex 
        justify-start 
        items-center 
        w-full 
        p-4 
        bg-gray-50 
        border-gray-200
        transition-all 
        duration-300 
        ease-in-out
        overflow-x-auto
        ${position === 'top' ? 'border-b' : 'border-t'}
      `}
      style={{
        order: position === 'top' ? 0 : 2,
      }}
    >
      <div className="flex items-center space-x-2">
        {elements.map((element, index) => (
          <NetworkItem
            key={element.id}
            item={element}
            onClick={() => onElementSelect(index)}
            isDraggable={true}
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkToolbar;