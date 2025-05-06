import React, { useState, useCallback } from 'react';
import { ContextMenuProps, MenuItem } from './types';
import SearchBar from './SearchBar';
import Category from './Category';
import { groupByCategory } from './utils';
import { useKeyboardNavigation } from './useKeyboardNavigation';

const ContextMenu: React.FC<ContextMenuProps> = ({ items, onItemClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Initialize all categories as expanded
    return items.reduce((acc, item) => {
      acc[item.category] = true;
      return acc;
    }, {} as Record<string, boolean>);
  });
  
  // Group items by category
  const categorizedItems = groupByCategory(items);
  
  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // If search is active, expand all categories
    if (value.trim()) {
      setExpandedCategories(prev => {
        const updated = { ...prev };
        Object.keys(categorizedItems).forEach(category => {
          updated[category] = true;
        });
        return updated;
      });
    }
  }, [categorizedItems]);
  
  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);
  
  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);
  
  // Setup keyboard navigation
  const { 
    menuRef, 
    handleKeyDown 
  } = useKeyboardNavigation({
    items,
    onItemClick,
    expandedCategories
  });
  
  return (
    <div
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-64 max-h-[400px] flex flex-col"
      role="menu"
      aria-label="Context menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      ref={menuRef}
    >
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClear={handleClearSearch}
      />
      
      <div className="overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 flex-1 py-1 space-y-1">
        {Object.entries(categorizedItems).map(([category, categoryItems]) => (
          <Category
            key={category}
            name={category}
            items={categoryItems}
            onItemClick={onItemClick}
            searchTerm={searchTerm}
          />
        ))}
        
        {Object.keys(categorizedItems).length === 0 && (
          <div className="px-3 py-4 text-center text-gray-500 text-sm">
            No items found
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextMenu;