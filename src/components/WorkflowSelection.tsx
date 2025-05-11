import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button} from "@mui/material";
import List, {ListItem} from "./CustomList";

// Show workflow selection screen
// New -> New workflow window
// Existing -> Load and proceed to MainNavigation


export const WorkflowSelection : React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ListItem[]>([
        { name: 'Design System Documentation', lastAccessed: new Date(2023, 5, 15, 9, 30) },
        { name: 'Product Roadmap 2025', lastAccessed: new Date(2023, 6, 2, 14, 45) },
        { name: 'User Research Findings', lastAccessed: new Date(2023, 5, 28, 11, 20) },
        { name: 'Marketing Campaign Assets', lastAccessed: new Date(2023, 6, 10, 16, 15) },
        { name: 'Quarterly Budget Review', lastAccessed: new Date(2023, 6, 12, 10, 0) },
      ]);
    const handleItemClick = (index: number) => {
        console.log(`Clicked on: ${items[index].name}`);
        // You would typically navigate or open the item here
    };

    const handleItemDelete = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
      
    return (
        <>
            <div>
                <h1>Workflow Selection</h1>
                <Button onClick={() => navigate("/new-workflow")}>New Workflow</Button>
                <Button >Existing Workflow</Button>
            </div>
            <div>
                <List data={items} onItemClick={handleItemClick} onItemDelete={handleItemDelete} />
            </div>
        </>
    );
}
