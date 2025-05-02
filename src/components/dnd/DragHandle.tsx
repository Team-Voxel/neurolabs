import React from 'react';
import { GripVertical } from 'lucide-react';
import type { DragHandleProps } from './types';

/**
 * Drag handle component that provides a visual indicator and touch target
 * for dragging operations
 */
export const DragHandle: React.FC<DragHandleProps> = ({ className = '' }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center p-1.5 cursor-grab active:cursor-grabbing 
        text-gray-500 hover:text-gray-700 touch-none transition-colors duration-200 
        ${className}`}
      data-drag-handle
      aria-label="Drag handle"
    >
      <GripVertical size={18} strokeWidth={2} />
    </div>
  );
};