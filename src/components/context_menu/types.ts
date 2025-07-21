export interface MenuItem {
  id: string;
  name: string;
  icon_url: string;
  category: string;
}

export interface ContextMenuProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}

export interface CategoryProps {
  name: string;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  searchTerm: string;
}

export interface MenuItemProps {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}