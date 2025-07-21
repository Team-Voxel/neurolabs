import React from 'react';
import { MenuItemProps } from './types';

const MenuItem: React.FC<MenuItemProps> = ({ item, onItemClick }) => {
  return (
    <div
      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 rounded-md group"
      onClick={() => onItemClick(item)}
      role="menuitem"
      tabIndex={-1}
      aria-label={item.name}
    >
      <div className="flex-shrink-0 w-6 h-6 mr-3">
        <img
          src={item.icon_url}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback for broken images
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cpath d="M12 8v4"/%3E%3Cpath d="M12 16h.01"/%3E%3C/svg%3E';
          }}
        />
      </div>
      <span className="text-gray-800 text-sm font-medium group-hover:text-blue-600 transition-colors duration-200">
        {item.name}
      </span>
    </div>
  );
};

export default MenuItem;