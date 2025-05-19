import React, { useState } from 'react';
import type { DropZoneProps } from './types';

export const DropZone: React.FC<DropZoneProps> = ({ 
  id, 
  onDrop,
  className = '',
  children 
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId && onDrop) {
      onDrop(itemId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};