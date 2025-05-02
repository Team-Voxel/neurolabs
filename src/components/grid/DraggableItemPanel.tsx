import React from 'react';
import { GridItem } from './GridItem';
import type { DraggableItemPanelProps } from './types';

export const DraggableItemPanel: React.FC<DraggableItemPanelProps> = ({
  items,
  onItemDrop,
  className = '',
}) => {
  const handleDragStart = (itemId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 ${className}`}>
      {items.map((item) => (
        <GridItem
          key={item.id}
          item={item}
          onDragStart={() => handleDragStart(item.id)}
          onDragEnd={() => {}}
        />
      ))}
    </div>
  );
};