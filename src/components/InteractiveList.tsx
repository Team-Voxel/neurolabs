import React, { useState, useCallback, useRef, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Typography } from 'antd';

export interface ListItem {
  id: string;
  title: string;
}

export interface InteractiveListProps {
  items: ListItem[];
  showSelectionInfo?: boolean;
  selectedItems?: string[];
  selectionMode?: 'single' | 'multiple';
  onSelect?: (itemId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onHover?: (itemId: string | null) => void;
  className?: string;
}

export interface ListItemProps {
  item: ListItem;
  isSelected: boolean;
  isHovered: boolean;
  selectionMode: 'single' | 'multiple';
  onClick: (itemId: string) => void;
  onHover: (itemId: string | null) => void;
}

const ListItem: React.FC<ListItemProps> = ({
  item,
  isSelected,
  isHovered,
  selectionMode,
  onClick,
  onHover
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleIdRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple effect
    const rippleId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: rippleId, x, y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId));
    }, 600);
    
    onClick(item.id);
  }, [item.id, onClick]);

  const handleMouseEnter = useCallback(() => {
    onHover(item.id);
  }, [item.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(item.id);
    }
  }, [item.id, onClick]);

  const baseClasses = `
    relative w-full px-6 py-4 text-left font-medium text-gray-800 
    border-2 rounded-xl transition-all duration-300 ease-out
    focus:outline-none focus:ring-4 focus:ring-teal-200 focus:ring-opacity-50
    transform active:scale-[0.98] overflow-hidden
    bg-white shadow-sm hover:shadow-lg
  `;

  const stateClasses = isSelected
    ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 shadow-lg ring-2 ring-teal-200'
    : isHovered
    ? 'border-coral-300 bg-gradient-to-r from-coral-50 to-rose-50 shadow-md'
    : 'border-gray-200 hover:border-sage-400 hover:bg-gradient-to-r hover:from-sage-50 hover:to-emerald-50';

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      role={selectionMode === 'multiple' ? 'checkbox' : 'option'}
      aria-checked={selectionMode === 'multiple' ? isSelected : undefined}
      aria-selected={selectionMode === 'single' ? isSelected : undefined}
      tabIndex={0}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-30" />
        </span>
      ))}
      
      {/* Content */}
      <div className="flex items-center justify-between relative z-10">
        <Typography.Title level={5}>{item.title}</Typography.Title>
        
        {/* Selection indicator */}
        <div className={`
          flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300
          ${isSelected 
            ? 'bg-teal-500 text-white scale-100 opacity-100' 
            : 'bg-gray-200 text-gray-400 scale-75 opacity-60'
          }
        `}>
          {selectionMode === 'multiple' ? (
            <Check className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`} />
          ) : (
            <div className={`w-2 h-2 rounded-full bg-current transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`} />
          )}
        </div>
      </div>
      
      {/* Animated selection bar */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 
        transition-all duration-300 ease-out rounded-r-full
        ${isSelected ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
      `} />
    </div>
  );
};

const InteractiveList: React.FC<InteractiveListProps> = ({
  items,
  showSelectionInfo = false,
  selectedItems = [],
  selectionMode = 'single',
  onSelect,
  onSelectionChange,
  onHover,
  className = ''
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = useCallback((itemId: string) => {
    let newSelection: string[];
    
    if (selectionMode === 'single') {
      newSelection = selectedItems.includes(itemId) ? [] : [itemId];
    } else {
      newSelection = selectedItems.includes(itemId)
        ? selectedItems.filter(id => id !== itemId)
        : [...selectedItems, itemId];
    }
    
    onSelect?.(itemId);
    onSelectionChange?.(newSelection);
  }, [selectedItems, selectionMode, onSelect, onSelectionChange]);

  const handleItemHover = useCallback((itemId: string | null) => {
    setHoveredItem(itemId);
    onHover?.(itemId);
  }, [onHover]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with selection info */}
      <div className="flex items-center justify-between mb-6">
        
        {selectedItems.length > 0 && showSelectionInfo && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-teal-100 rounded-lg">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-teal-700 font-medium">
              {selectedItems.length} selected
            </span>
          </div>
        )}
      </div>
      
      {/* List items */}
      <div 
        className="flex-1 overflow-y-auto space-y-2 px-2"
        role={selectionMode === 'multiple' ? 'group' : 'listbox'}
        aria-label="Interactive list items"
      >
        {items.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            isHovered={hoveredItem === item.id}
            selectionMode={selectionMode}
            onClick={handleItemClick}
            onHover={handleItemHover}
          />
        ))}
      </div>
      
      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
          <p className="text-gray-500 font-medium">No items to display</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveList;