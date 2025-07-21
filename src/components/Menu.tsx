import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Typography } from 'antd';


export type MenuItem = {
    key: string;
    label: string;
    children?: MenuItem[];
  };

interface MenuProps {
  items: MenuItem[];
  onSelect?: (key: string, item: MenuItem) => void;
  className?: string;
  defaultSelectedKey?: string;
  defaultExpandedKeys?: Set<string>;
}

interface MenuItemProps {
  item: MenuItem;
  selectedKey: string | null;
  expandedKeys: Set<string>;
  onSelect: (key: string, item: MenuItem) => void;
  onToggleExpand: (key: string) => void;
  level?: number;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  selectedKey,
  expandedKeys,
  onSelect,
  onToggleExpand,
  level = 0,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedKeys.has(item.key);
  const isSelected = selectedKey === item.key;
  const isLeaf = !hasChildren;

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(item.key);
    } else {
      onSelect(item.key, item);
    }
  };

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={`
          flex flex-row items-center justify-items-end justify-between px-4 py-3 cursor-pointer
          transition-all duration-200 ease-out
          border-l-4 border-transparent
          ${level === 0 ? 'font-medium' : 'font-normal ml-4'}
          ${level === 0 ? 'text-gray-800' : 'text-gray-600'}
          ${
            isLeaf
              ? isSelected
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-500 text-blue-900 shadow-sm'
                : 'hover:bg-gray-50 hover:border-l-gray-300'
              : isExpanded
              ? 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-900'
              : 'hover:bg-gray-50'
          }
          ${level > 0 ? 'text-sm' : ''}
        `}
      >
        <Typography.Title level={5} className="flex truncate">{item.label}</Typography.Title>
        {hasChildren && (
          <div
            className={`
              transition-transform duration-200 ease-out ml-2
              ${isExpanded ? 'rotate-90' : 'rotate-0'}
            `}
          >
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        )}
      </div>

      {hasChildren && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-out
            ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="bg-gradient-to-r from-gray-25 to-slate-25 border-l border-gray-100 ml-2">
            {item.children?.map((child) => (
              <MenuItemComponent
                key={child.key}
                item={child}
                selectedKey={selectedKey}
                expandedKeys={expandedKeys}
                onSelect={onSelect}
                onToggleExpand={onToggleExpand}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Menu: React.FC<MenuProps> = ({ items, onSelect, className = '', defaultSelectedKey, defaultExpandedKeys }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(defaultSelectedKey || null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(defaultExpandedKeys || new Set());

  const handleSelect = (key: string, item: MenuItem) => {
    setSelectedKey(key);
    onSelect?.(key, item);
  };

  const handleToggleExpand = (key: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  return (
    <div 
      className={`
        h-full bg-white border border-gray-200 shadow-sm overflow-hidden
        ${className}
      `}
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="py-2">
          {items.map((item) => (
            <MenuItemComponent
              key={item.key}
              item={item}
              selectedKey={selectedKey}
              expandedKeys={expandedKeys}
              onSelect={handleSelect}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      </div>
    </div>
  );
};