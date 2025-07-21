import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { MenuBarProps, MenuItem } from '../types/window';

const getThemeClasses = (theme: 'light-modern' | 'light-quiet' | 'dark-modern') => {
  switch (theme) {
    case 'light-modern':
      return {
        menu: 'bg-white border-gray-200 shadow-lg',
        item: 'text-gray-800',
        hover: 'hover:bg-[#e8e8e8]',
        active: 'bg-[#dadada]',
      };
    case 'light-quiet':
      return {
        menu: 'bg-[#f8f8f8] border-gray-200 shadow-lg',
        item: 'text-gray-700',
        hover: 'hover:bg-[#eaeaea]',
        active: 'bg-[#e0e0e0]',
      };
    case 'dark-modern':
      return {
        menu: 'bg-[#252526] border-[#454545] shadow-lg',
        item: 'text-[#cccccc]',
        hover: 'hover:bg-[#2a2a2a]',
        active: 'bg-[#37373d]',
      };
  }
};

const MenuItemComponent: React.FC<{
  item: MenuItem;
  level?: number;
  theme?: 'light-modern' | 'light-quiet' | 'dark-modern';
}> = ({ item, level = 0, theme = 'dark-modern' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const themeClasses = getThemeClasses(theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      ref={ref}
      className="relative"
      onMouseEnter={() => level > 0 && setIsOpen(true)}
      onMouseLeave={() => level > 0 && setIsOpen(false)}
    >
      <div
        role="menuitem"
        tabIndex={0}
        className={`
          flex items-center justify-between px-3 py-[6px] cursor-default text-sm
          ${themeClasses.item}
          ${themeClasses.hover}
          ${isOpen ? themeClasses.active : ''}
        `}
        onClick={() => {
          if (item.items) {
            setIsOpen(!isOpen);
          } else {
            item.onClick?.();
          }
        }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2">
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span>{item.label}</span>
        </div>
        <div className="flex items-center">
          {item.shortcut && (
            <span className="ml-12 text-xs opacity-60">{item.shortcut}</span>
          )}
          {item.items && level > 0 && (
            <ChevronRight className="w-4 h-4 ml-2 opacity-60" />
          )}
        </div>
      </div>

      {item.items && isOpen && (
        <div
          className={`
            absolute z-50 min-w-[200px] py-1 border rounded-sm
            ${level === 0 ? 'top-full left-0' : 'left-full top-0'}
            ${themeClasses.menu}
          `}
          role="menu"
        >
          {item.items.map((subItem, index) => (
            <MenuItemComponent
              key={index}
              item={subItem}
              level={level + 1}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MenuBar: React.FC<MenuBarProps> = ({
  items,
  theme = 'dark-modern',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const themeClasses = getThemeClasses(theme);

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className={`px-4 py-2 text-sm ${themeClasses.item} ${themeClasses.hover}`}
      >
        ☰ Menu
      </button>
    );
  }

  return (
    <div 
      className="flex items-center"
      role="menubar"
    >
      {items.map((item, index) => (
        <MenuItemComponent
          key={index}
          item={item}
          theme={theme}
        />
      ))}
    </div>
  );
};