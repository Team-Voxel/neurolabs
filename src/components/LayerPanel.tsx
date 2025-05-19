import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
//import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { DraggableItemPanel } from './grid/DraggableItemPanel';
import { DropZone } from './grid/DropZone';
import type { GridItem } from './grid/types';


const initialItems: GridItem[] = [
    {
      id: '1',
      title: 'Mountain Landscape',
      imageUrl: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'A beautiful mountain landscape with snow-capped peaks and a clear blue sky.',
    },
    {
      id: '2',
      title: 'Ocean Sunset',
      imageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Stunning sunset over the ocean with vibrant orange and purple hues.',
    },
    {
      id: '3',
      title: 'Forest Path',
      imageUrl: 'https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'A serene forest path surrounded by tall trees and morning mist.',
    },
    {
      id: '4',
      title: 'Desert Dunes',
      imageUrl: 'https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Rolling sand dunes in a vast desert landscape at golden hour.',
    },
    {
      id: '5',
      title: 'City Lights',
      imageUrl: 'https://images.pexels.com/photos/1538177/pexels-photo-1538177.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Vibrant city skyline at night with glowing lights and modern architecture.',
    },
  ];

const initialDroppedItems = () :GridItem[] => {
    const items = initialItems.map((item) => ({
        ...item,
        isDropped: false,
    }));
    return items;
}

export default function AccordionUsage() {

    const [items] = useState<GridItem[]>(initialDroppedItems());


    return (
      <div>
        <Accordion>
          <AccordionSummary
            //expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span">Classical Models</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DraggableItemPanel items={items} className="mb-8" />
            {/* <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                <div className="max-w-6xl mx-auto">
                </div>
            </div> */}
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }