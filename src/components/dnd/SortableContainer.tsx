import React, { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { getDirectionLock, createLoadingPlaceholders } from './utils';
import type { SortableContainerProps, DndDirection } from './types';

/**
 * A container component that provides drag-and-drop functionality for its children
 * 
 * Features:
 * - Vertical, horizontal, or free-form sorting
 * - Customizable appearance and behavior
 * - Support for keyboard, mouse, and touch interactions
 * - Loading state for async operations
 * - Callback functions for drag events
 */
export const SortableContainer: React.FC<SortableContainerProps> = ({
  children,
  items: initialItems,
  onItemsChange,
  direction = 'vertical',
  className = '',
  containerClassName = '',
  isLoading = false,
  dragHandleSelector,
  onDragStart,
  onDragEnd,
  onDragOver,
  disabled = false,
}) => {
  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        ...getDirectionLock(direction),
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
        ...getDirectionLock(direction),
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Determine which sorting strategy to use based on direction
  const getSortingStrategy = (dir: DndDirection) => {
    switch (dir) {
      case 'vertical':
        return verticalListSortingStrategy;
      case 'horizontal':
        return horizontalListSortingStrategy;
      case 'both':
      default:
        return rectSortingStrategy;
    }
  };

  // Event handlers for drag operations
  const handleDragStart = (event: DragStartEvent) => {
    if (onDragStart) {
      onDragStart(event.active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (onDragOver && event.over) {
      onDragOver(event.over.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (onItemsChange) {
        const oldIndex = initialItems.indexOf(active.id as string);
        const newIndex = initialItems.indexOf(over.id as string);
        
        // Create a new array with the updated order
        const newItems = arrayMove(initialItems, oldIndex, newIndex);
        onItemsChange(newItems);
      }
    }

    if (onDragEnd) {
      onDragEnd(active.id as string);
    }
  };

  // Loading state UI
  if (isLoading) {
    const placeholders = createLoadingPlaceholders(4);
    
    return (
      <div className={`${className}`}>
        <div className={`${containerClassName} ${
          direction === 'horizontal' ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col space-y-4'
        }`}>
          {placeholders.map((item) => (
            <div 
              key={item.id}
              className="animate-pulse rounded-lg"
              style={{ width: direction === 'horizontal' ? '150px' : item.width }}
            >
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        autoScroll={{
          threshold: {
            x: 0.15,
            y: 0.15
          },
          acceleration: 15,
        }}
      >
        <SortableContext 
          items={initialItems} 
          strategy={getSortingStrategy(direction)}
          disabled={disabled}
        >
          <div 
            className={`${containerClassName} ${
              direction === 'horizontal' ? 'flex flex-row flex-wrap' : 'flex flex-col'
            }`}
            aria-roledescription="sortable container"
          >
            {children}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};