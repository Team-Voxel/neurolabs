import React from 'react';
import { SortableItem } from './SortableItem';
import { SortableContainer } from './SortableContainer';
import type { NestedSortableItemProps } from './types';

/**
 * A sortable item that can contain other sortable items
 * 
 * Features:
 * - Supports nested drag-and-drop operations
 * - Independent sorting of parent and child items
 * - Customizable rendering of child items
 */
export const NestedSortableItem: React.FC<NestedSortableItemProps> = ({
  id,
  children,
  className = '',
  dragHandleSelector,
  childItems = [],
  onChildItemsChange,
  renderItem,
  disabled = false,
}) => {
  return (
    <SortableItem 
      id={id} 
      className={className} 
      dragHandleSelector={dragHandleSelector}
      disabled={disabled}
    >
      {children}
      
      {childItems.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
          <SortableContainer
            items={childItems}
            onItemsChange={onChildItemsChange}
            direction="vertical"
            containerClassName="space-y-2"
            dragHandleSelector={dragHandleSelector}
            disabled={disabled}
          >
            {childItems.map((childId) => (
              <SortableItem 
                key={childId} 
                id={childId} 
                dragHandleSelector={dragHandleSelector}
                disabled={disabled}
              >
                {renderItem(childId)}
              </SortableItem>
            ))}
          </SortableContainer>
        </div>
      )}
    </SortableItem>
  );
};