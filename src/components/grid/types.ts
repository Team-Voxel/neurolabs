import { ReactNode } from 'react';

export interface GridItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

export interface DraggableItemPanelProps {
  items: GridItem[];
  onItemDrop?: (itemId: string, dropZoneId: string) => void;
  className?: string;
}

export interface GridItemProps {
  item: GridItem;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}

export interface DropZoneProps {
  id: string;
  onDrop?: (itemId: string) => void;
  className?: string;
  children?: ReactNode;
}