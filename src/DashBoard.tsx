import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SelectionGrid from './components/selectionGrid';
import { Box, Button, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import { MaterialDialog } from './components/materialDialog';


// Header info of the dataframe. Headers from backend. Info is processed locally
const columns: GridColDef<(typeof rows)[number]>[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'firstName', headerName: 'First name', width: 150, editable: true },
  { field: 'lastName', headerName: 'Last name', width: 150, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', width: 110, editable: true, },
  { field: 'fullName', headerName: 'Full name',description: 'This column has a value getter and is not sortable.', sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
];

// Head of the dataframe. Received from backend
const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

// Models available for the current dataset and the problem. Received from backend
const currentlyAvailableModels = [{name:'SVM'}, {name:'Random Forest'}, {name:'ANN'}];

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



const Dashboard: React.FC = () => {

  
const [activeModelIndex, setActiveModelIndex] = useState<number>(0);

const [isModelMenuOpen, setIsModelMenuOpen] = useState<boolean>(false);
const [modelName, setModelName] = useState<string>("Model Name");
const [newModelIndex, setNewModelIndex] = useState<number>(0);

const handleSelect = (index: number) => {
  setActiveModelIndex(index);
};

const addNewModel = () => {
  setActiveModelIndex(-1);
  setIsModelMenuOpen(true);
}

const handleAddNewModel = () => {
  setIsModelMenuOpen(false);
  // pass
}

const handleNewModelOnSelect = (index: number) => {
  setNewModelIndex(index);
}

const selectAndOpenModel = () => {

}

  return (
    <div className="w-full h-full flex m-0 p-0">
      <div className='w-3/5 p-0 flex flex-col space-y-2'>
        <div className="p-2 h-2/3 bg-white shadow-md rounded-lg">
          <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          density='compact'
          onCellClick={(event) => {event.field === 'fullName' && setActiveModelIndex(2)}}
          />
        </div>
        <div className="h-1/3 flex flex-rows space-x-2">
          <div className="p-4 w-2/3 bg-white shadow-md rounded-lg">div for table</div>
          <div className="p-4 w-1/3 flex flex-col shadow-md space-y-2">
            <button className="p-3 border rounded-lg shadow hover:bg-gray-200">button 1</button>
            <button className="p-3 border rounded-lg shadow hover:bg-gray-200">button 2</button>
            <button className="p-3 border rounded-lg shadow hover:bg-gray-200">button 3</button>
          </div>
        </div>
      </div>
      <div className="border w-2/5 p-2 justify-items-stretch h-full space-y-2"> 
        {/* <ImageButton hideUnderline imageUrl={plusIcon} title=' ' width='' height='100px'/>
        {availableModels.map(model => (
          <ImageButton hideUnderline imageUrl={plusIcon} title={model} width='' height='100px'/>
        ))}  */}
        <Box sx={{ height: 1/2 }} style={{overflow: 'auto', padding: '10px' }}>
        
          <SelectionGrid
            hideTooltip
            items={currentProjects}
            selectedItem={activeModelIndex}
            onSelect={handleSelect}
            gridColumns={3}
            buttonSize={{ width: '100%', height: '100px' }}
            optionToAddNewItem={true}
            onAddNewItem={addNewModel}
            addNewItemTitle="Add New Model"
          />
        </Box>
        {activeModelIndex !== -1 && <Box>
          <Typography>
            {currentProjects[activeModelIndex].name}
          </Typography>
          <Button fullWidth variant="contained" onClick={() => selectAndOpenModel()}>Open Model</Button>
        </Box>}
      </div>
        
        <MaterialDialog
          open={isModelMenuOpen}
          onClose={() => setIsModelMenuOpen(false)}
          onConfirm={handleAddNewModel}
          title="Create New Model"
          confirmText="Create and Open"
          keepMounted
        >
          <div className="flex flex-col gap-4">
            <Box sx={{ height: '400px'}} style={{overflow: 'auto', padding: '10px'}}>
              <TextField style={{margin: '0 0 20px 0'}} fullWidth label="Model Name" variant="outlined" value={modelName} placeholder='Enter model name' onChange={(e) => setModelName(e.target.value)} />
              
              <SelectionGrid
               items={currentlyAvailableModels}
               selectedItem={newModelIndex}
               onSelect={handleNewModelOnSelect}
               gridColumns={3}
               buttonSize={{ width: '100%', height: '100px' }}
               onAddNewItem={addNewModel}
               addNewItemTitle="Add New Model"
               
               />
            </Box>
          </div>
        </MaterialDialog>

    </div>
  );
};


export default Dashboard;
