import React, { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import type { TitleBarProps, MenuItem } from '../types/window';
import { MenuBar } from './MenuBar';

const getThemeClasses = (theme: 'light-modern' | 'light-quiet' | 'dark-modern') => {
  switch (theme) {
    case 'light-modern':
      return {
        bar: 'bg-[#f3f3f3] text-[#424242] border-[#e7e7e7]',
        hover: 'hover:bg-[#e8e8e8]',
        active: 'active:bg-[#dadada]',
        close: 'hover:bg-red-500 hover:text-white',
      };
    case 'light-quiet':
      return {
        bar: 'bg-[#f5f5f5] text-[#616161] border-[#ececec]',
        hover: 'hover:bg-[#eaeaea]',
        active: 'active:bg-[#e0e0e0]',
        close: 'hover:bg-red-400 hover:text-white',
      };
    case 'dark-modern':
      return {
        bar: 'bg-[#1e1e1e] text-[#cccccc] border-[#1a1a1a]',
        hover: 'hover:bg-[#2a2a2a]',
        active: 'active:bg-[#333333]',
        close: 'hover:bg-red-600 hover:text-white',
      };
  }
};

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  icon,
  onMinimize,
  onMaximize,
  onClose,
  theme = 'dark-modern'
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const themeClasses = getThemeClasses(theme);

  const menuItems: MenuItem[] = [
    {
      label: 'File',
      items: [
        { label: 'New File', shortcut: '⌘N', onClick: () => console.log('New File') },
        { label: 'Open File...', shortcut: '⌘O', onClick: () => console.log('Open File') },
        { label: 'Save', shortcut: '⌘S', onClick: () => console.log('Save') },
        { label: 'Save As...', shortcut: '⇧⌘S', onClick: () => console.log('Save As') },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', onClick: () => console.log('Undo') },
        { label: 'Redo', shortcut: '⇧⌘Z', onClick: () => console.log('Redo') },
        { label: 'Cut', shortcut: '⌘X', onClick: () => console.log('Cut') },
        { label: 'Copy', shortcut: '⌘C', onClick: () => console.log('Copy') },
        { label: 'Paste', shortcut: '⌘V', onClick: () => console.log('Paste') },
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Command Palette...', shortcut: '⇧⌘P', onClick: () => console.log('Command Palette') },
        { label: 'Toggle Sidebar', shortcut: '⌘B', onClick: () => console.log('Toggle Sidebar') },
        { label: 'Toggle Terminal', shortcut: '⌘J', onClick: () => console.log('Toggle Terminal') },
      ]
    }
  ];

  return (
    <div className={`flex flex-col select-none ${themeClasses.bar}`}>
      <div className="h-[32px] flex items-center justify-between border-b">
        <div className="flex items-center flex-1">
          {/* Icon */}
          {/* Menu bar */}
          <div className="flex items-center h-full px-2">
            <MenuBar
              items={menuItems}
              theme={theme}
              isCollapsed={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};