import React from 'react';
import { Trash } from 'lucide-react';

export interface ListItem {
    name: string;
    lastAccessed: Date;
  }

interface ListItemProps {
  item: ListItem;
  index: number;
  onItemClick: (index: number) => void;
  onItemDelete: (index: number) => void;
}

export const ListItem: React.FC<ListItemProps> = ({ 
  item, 
  index, 
  onItemClick, 
  onItemDelete 
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <li className="flex items-center px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 group">
      <div
        className="flex-1 truncate cursor-pointer"
        onClick={() => onItemClick(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onItemClick(index);
          }
        }}
        aria-label={`Select ${item.name}`}
      >
        <span className="text-gray-800 font-medium">{item.name}</span>
      </div>
      <div className="w-48 text-gray-500 text-sm">
        {formatDate(item.lastAccessed)}
      </div>
      <div className="w-12 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onItemDelete(index);
          }}
          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Delete ${item.name}`}
        >
          <Trash size={18} />
        </button>
      </div>
    </li>
  );
};


  
  export interface ListProps {
    data: ListItem[];
    onItemClick: (index: number) => void;
    onItemDelete: (index: number) => void;
  }

const List: React.FC<ListProps> = ({ data, onItemClick, onItemDelete }) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex-1 font-medium text-gray-700">Name</div>
        <div className="w-48 font-medium text-gray-700">Last Accessed Date</div>
        <div className="w-12"></div>
      </div>

      {/* List Items */}
      <ul className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <li className="px-6 py-4 text-gray-500 italic">No items to display</li>
        ) : (
          data.map((item, index) => (
            <li
              key={index}
              className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors duration-150 group"
            >
              <div
                className="flex-1 truncate cursor-pointer"
                onClick={() => onItemClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onItemClick(index);
                  }
                }}
                aria-label={`Select ${item.name}`}
              >
                <span className="text-gray-800 font-medium">{item.name}</span>
              </div>
              <div className="w-48 text-gray-500 text-sm">
                {formatDate(item.lastAccessed)}
              </div>
              <div className="w-12 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemDelete(index);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default List;