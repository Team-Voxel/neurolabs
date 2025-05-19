import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import LayerPanel from './components/LayerPanel';
import Canvas from './components/nodes/Canvas';
import { DropZone } from './components/grid/DropZone';

const ModelWindow : React.FC = () => {

    const handleItemDrop = (itemId: string) => {
        console.log(`Item dropped: ${itemId}`);
        // Handle the dropped item here
    };

    return (
        <></>
    );
}


export default ModelWindow;