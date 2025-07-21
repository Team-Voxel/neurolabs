/**
 * Utility functions for the drag-and-drop components
 */
import type { DndDirection } from './types';

/**
 * Get direction lock constraints based on the specified direction
 */
export function getDirectionLock(direction: DndDirection) {
  switch (direction) {
    case 'vertical':
      return { vertical: false, horizontal: true };
    case 'horizontal':
      return { vertical: true, horizontal: false };
    case 'both':
    default:
      return { vertical: false, horizontal: false };
  }
}

/**
 * Get animation properties based on whether the item is being dragged
 */
export function getDragAnimationStyles(isDragging: boolean) {
  return {
    transition: isDragging ? 'none' : 'transform 200ms ease, opacity 200ms ease',
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    scale: isDragging ? 1.05 : 1,
  };
}

/**
 * Create an array of placeholder items for loading state
 */
export function createLoadingPlaceholders(count: number = 3) {
  return Array.from({ length: count }).map((_, index) => ({
    id: `placeholder-${index}`,
    width: `${Math.floor(Math.random() * 30) + 70}%`,
  }));
}