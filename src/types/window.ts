export interface WindowState {
    isMaximized: boolean;
    isMinimized: boolean;
  }
  
  export interface MenuItem {
    label: string;
    icon?: string;
    shortcut?: string;
    items?: MenuItem[];
    onClick?: () => void;
  }
  
  export interface TitleBarProps {
    title: string;
    icon?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onClose?: () => void;
    theme?: 'light-modern' | 'light-quiet' | 'dark-modern';
  }
  
  export interface MenuBarProps {
    items: MenuItem[];
    theme?: 'light-modern' | 'light-quiet' | 'dark-modern';
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
  }