
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import React from 'react';
import MainMenu from './components/main_menu/MainMenu';
import { ProjectSelection } from './components/ProjectSelection';
import ProjectSetupWizard from './newProjectMenu';
import { WorkflowSelection } from './components/WorkflowSelection';
import SortablePipeline from './components/SortablePipeline';
import Main from 'electron/main';
import { Playground } from './components/Playground';
import  MainNavigation from './components/MainNavigation';

// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => void;
    };
  }
}


function App() {

return (
  <HashRouter>
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/project-selection" element={<ProjectSelection />} />
      <Route path="/new-workflow" element={<ProjectSetupWizard />} />
      <Route path="/workflow-selection" element={<WorkflowSelection/>} />
      <Route path="/nodes" element={<SortablePipeline />} />
      <Route path="/sandbox" element={<MainNavigation/>} />
      <Route path="/explore" element={<div>Explore</div>} />
      <Route path="/settings" element={<div>Settings</div>} />
    </Routes>
  </HashRouter>
);
}

export default App;
