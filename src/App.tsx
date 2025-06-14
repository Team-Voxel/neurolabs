
import { HashRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import MainMenu from './components/main_menu/MainMenu';
import { ProjectSelection } from './components/ProjectSelection';
import { WorkflowSelection } from './components/WorkflowSelection';
import SortablePipeline from './components/SortablePipeline';
import { WorkflowWizard } from './components/NewWorkflow/WorkflowWizard';
import  MainNavigation from './components/MainNavigation';
import WaitForComputation from './components/NewWorkflow/WaitForComputation';
import { ChildWindowHost } from './components/ChildWindowHost';
import { LearnInterface } from './components/learn/LearnInterface';

/* // Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => void;
    };
  }
} */

const componentMap: Record<string, React.FC<any>> = {
  'WorkflowWizard': WorkflowWizard,
  'MainNavigation': MainNavigation,
};


function App() {

return (
  <HashRouter>
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/project-selection" element={<ProjectSelection />} />
      <Route path="/new-workflow" element={<WorkflowWizard />} />
      <Route path="/workflow-selection" element={<WorkflowSelection/>} />
      <Route path="/nodes" element={<SortablePipeline />} />
      <Route path="/sandbox" element={<MainNavigation/>} />
      <Route path="/explore" element={<div>Explore</div>} />
      <Route path="/settings" element={<div>Settings</div>} />
      <Route path="/wait-screen" element={<WaitForComputation/>} />
      <Route path="/child" element={<ChildWindowHost componentMap={componentMap} />} />
      <Route path="/learn" element={<LearnInterface />} />
    </Routes>
  </HashRouter>
);
}

export default App;
