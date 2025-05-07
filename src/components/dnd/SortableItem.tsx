import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SortableItemProps } from './types';

/**
 * A sortable item that can be dragged and dropped within a SortableContainer
 * 
 * Features:
 * - Visual feedback during drag operations
 * - Optional drag handle support
 * - Smooth animations when positions change
 * - Maintains state during drag operations
 */
export const SortableItem: React.FC<SortableItemProps> = ({ 
  id, 
  children, 
  className = '',
  dragHandleSelector,
  disabled = false
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
  } = useSortable({ 
    id,
    disabled,
    ...(dragHandleSelector ? { handle: dragHandleSelector } : {})
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative touch-manipulation ${className}`}
      {...({ ...attributes, ...listeners })}
      data-dragging={isDragging ? 'true' : undefined}
      aria-roledescription="sortable item"
    >
      <div 
        className={`transition-all duration-200 ease-in-out 
          ${isDragging ? 'scale-105 shadow-lg bg-blue-50 border-blue-300 z-10' : ''}
          ${isSorting ? 'transition-transform' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {children}
      </div>
    </div>
  );
};