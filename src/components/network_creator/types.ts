export interface DraggableItem {
    id: string;
    name: string;
    imageUrl: string;
    tooltipContent: string;
  }

  export interface ActiveNetworkElement {
    id: number;
    type: string;
  }
  
  export type ToolbarPosition = 'top' | 'bottom';
  
  export interface NetworkCreatorProps {
    toolbarPosition: ToolbarPosition;
    elements: DraggableItem[];
    onElementSelect: (elementId: number) => void;
    onLayersChange: (layers: ActiveNetworkElement[]) => void;
  }
  
  export interface NetworkToolbarProps {
    position: ToolbarPosition;
    elements: DraggableItem[];
    onElementSelect: (elementId: number) => void;
  }
  
  export interface NetworkLayersProps {
    layers: ActiveNetworkElement[];
    allElements: DraggableItem[];
    onLayersChange: (layers: ActiveNetworkElement[]) => void;
    onElementSelect: (elementId: number) => void;
    selectedElementId: number | null;
  }
  
  export interface NetworkItemProps {
    item: DraggableItem;
    isSelected?: boolean;
    onClick: () => void;
    isDraggable?: boolean;
    index?: number;
  }
  
  export interface DragItem {
    type: string;
    id: string;
    index?: number;
  }