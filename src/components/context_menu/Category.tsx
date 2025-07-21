import React, { useState } from 'react';
import { CategoryProps } from './types';
import MenuItem from './MenuItem';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Category: React.FC<CategoryProps> = ({ 
  name, 
  items, 
  onItemClick,
  searchTerm 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Filter items based on search term if one exists
  const visibleItems = searchTerm 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;
  
  // Don't render if no visible items after filtering
  if (visibleItems.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 rounded-md transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`category-${name}`}
      >
        <span>{name}</span>
        <span className="text-gray-400">
          {isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </span>
      </button>
      
      <div 
        id={`category-${name}`}
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="pl-2 space-y-1 mt-1">
          {visibleItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;