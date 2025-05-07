import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { TitleBar } from './components/TitleBar';
import Dashboard from './DashBoard';
import {Box, Tab, Tabs} from '@mui/material'
import Canvas from './nodes/Canvas';
import LayerPanel from './components/LayerPanel';
import ModelWindow from "./ModelWindow";
import { ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from "./nodes/dndContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `workflow-tab-${index}`,
    'aria-controls': `workflow-tabpanel-${index}`,
  };
}

function WorkflowEditor() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* <TitleBar
        title="VS Code-style Editor"
        theme='light-modern'
        onMinimize={() => console.log('Minimize')}
        onMaximize={() => console.log('Maximize')}
        onClose={() => console.log('Close')}
      /> */}

      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      </Box> */}
      <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}
    >
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" orientation="vertical">
          <Tab label="Data" {...a11yProps(0)} />
          <Tab label="Model" {...a11yProps(1)} />
          <Tab label="Performance" {...a11yProps(2)} />
        </Tabs>
      {value === 0 && (
        <ReactFlowProvider>
        <DnDProvider>
        <Canvas />
        </DnDProvider>
        </ReactFlowProvider>
        )}
      <CustomTabPanel value={value} index={1}>
        <Dashboard></Dashboard>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Item Three
      </CustomTabPanel>
      </Box>
    </div>
  );
}


export default WorkflowEditor;