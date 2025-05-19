import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { MenuItem } from './types';

interface UseKeyboardNavigationParams {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  expandedCategories: Record<string, boolean>;
}

export const useKeyboardNavigation = ({ 
  items, 
  onItemClick,
  expandedCategories
}: UseKeyboardNavigationParams) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Build a flat list of visible items based on expanded categories
  const visibleItems = items.filter(item => expandedCategories[item.category]);
  
  useEffect(() => {
    // Reset item refs when items change
    itemRefs.current = itemRefs.current.slice(0, visibleItems.length);
  }, [visibleItems.length]);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!visibleItems.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null || prev >= visibleItems.length - 1) {
            return 0;
          }
          return prev + 1;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null || prev <= 0) {
            return visibleItems.length - 1;
          }
          return prev - 1;
        });
        break;
        
      case 'Enter':
        if (focusedIndex !== null && visibleItems[focusedIndex]) {
          e.preventDefault();
          onItemClick(visibleItems[focusedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setFocusedIndex(null);
        break;
        
      default:
        break;
    }
  };
  
  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex !== null && itemRefs.current[focusedIndex] && menuRef.current) {
      const itemEl = itemRefs.current[focusedIndex];
      const menuEl = menuRef.current;
      
      const itemRect = itemEl!.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      
      if (itemRect.bottom > menuRect.bottom) {
        itemEl!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else if (itemRect.top < menuRect.top) {
        itemEl!.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [focusedIndex]);
  
  return {
    focusedIndex,
    setFocusedIndex,
    menuRef,
    itemRefs,
    handleKeyDown,
    visibleItems
  };
};