import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import Button from "./CreateNewButton";
import List, {ListItem} from "./CustomList";
import Plus from "../assets/plus.png"
import File from "../assets/folders.png"
import SelectionGrid from "./selectionGrid";

// Show workflow selection screen
// New -> New workflow window
// Existing -> Load and proceed to MainNavigation

// Models that were made by the user. Received from backend
const currentProjects = [
    {
      name: 'Mountain View',
      tooltip: 'Beautiful mountain landscape',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Ocean Sunset',
      tooltip: 'Peaceful ocean sunset view',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Forest Path',
      tooltip: 'Serene forest walking path',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'City Lights',
      tooltip: 'Vibrant city nightlife',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Desert Dunes',
      tooltip: 'Majestic desert landscape',
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'No Image Option',
      tooltip: 'Selection without background image',
    },
    {
      name: 'No Image Option',
      tooltip: 'Selection without background image',
    },
    {
      name: 'No Image Option',
      tooltip: 'Selection without background image',
    },
  ];

export const WorkflowSelection : React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ListItem[]>([
        { name: 'Design System Documentation', lastAccessed: new Date(2023, 5, 15, 9, 30) },
        { name: 'Product Roadmap 2025', lastAccessed: new Date(2023, 6, 2, 14, 45) },
        { name: 'User Research Findings', lastAccessed: new Date(2023, 5, 28, 11, 20) },
        { name: 'Marketing Campaign Assets', lastAccessed: new Date(2023, 6, 10, 16, 15) },
        { name: 'Quarterly Budget Review', lastAccessed: new Date(2023, 6, 12, 10, 0) },
      ]);

    const [activeModelIndex, setActiveModelIndex] = useState<number>(0);
    const handleSelect = (index: number) => {
        setActiveModelIndex(index);
      };


    const handleItemClick = (index: number) => {
        console.log(`Clicked on: ${items[index].name}`);
        navigate("/sandbox");
    };

    const handleItemDelete = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const addNewModel = () => {
        console.log("Add new model");
      }
      
    return (
        <div className="flex flex-col items-center w-screen h-screen bg-gray-100 p-4 gap-8">
            <h1>Workflow Selection</h1>
            <SelectionGrid
                items={currentProjects}
                selectedItem={activeModelIndex}
                onSelect={handleSelect}
                gridColumns={4}
                buttonSize={{ width: '200px', height: '150px' }}
                optionToAddNewItem={true}
                onAddNewItem={addNewModel}
                addNewItemTitle="Add New Model"
            />
            {/* <div className="flex flex-row items-center justify-center gap-8 mt-4">
                <Button icon={Plus} label="New Workflow" onClick={() => navigate("/new-workflow")}/>
                <Button icon={File} label="Existing Workflow"/>
            </div>
            <div className="flex flex-col items-center justify-center mt-8">
                <List data={items} onItemClick={handleItemClick} onItemDelete={handleItemDelete} />
            </div> */}
        </div>
    );
}
