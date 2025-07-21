/**
 * Type definitions for the drag-and-drop components
 */

// Direction options for the sortable container
export type DndDirection = 'vertical' | 'horizontal' | 'both';

// Props for the SortableContainer component
export interface SortableContainerProps {
  children: React.ReactNode;
  items: string[]; // array of item IDs
  onItemsChange?: (items: string[]) => void;
  direction?: DndDirection;
  className?: string;
  containerClassName?: string;
  isLoading?: boolean;
  dragHandleSelector?: string;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
  onDragOver?: (id: string) => void;
  disabled?: boolean;
}

// Props for the SortableItem component
export interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  dragHandleSelector?: string;
  disabled?: boolean;
}

// Props for the DragHandle component
export interface DragHandleProps {
  className?: string;
}

// Props for the NestedSortableItem component
export interface NestedSortableItemProps extends SortableItemProps {
  childItems?: string[];
  onChildItemsChange?: (childItems: string[]) => void;
  renderItem: (id: string) => React.ReactNode;
}