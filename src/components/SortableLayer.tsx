import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';


export class SortableLayer {
    inShape : string = '1x1';
    outShape : string = '1x1';
    name : string = 'Layer';
    type : string = 'layer';
    id : string = 'layer-1';
    color : string = '#000000';
};

function SortableItem(props : any, item : SortableLayer) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({id: props.id});
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {/* ... */}
      </div>
    );
}


export default SortableItem;