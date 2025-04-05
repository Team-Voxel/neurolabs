import React from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Extend the Window interface if needed
declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => void;
      exitApp: () => void;
    };
  }
}

import plusIcon from './assets/plus.svg';
import open from './assets/folder-input.svg';
import './App.css';
import Button from './components/createNewButton';
import CreateProjectPage from './newProject';        
import NewProjectMenu from './newProjectMenu';         
import MenuWindow from './firstMenu';                  

// Define your main app content (HomePage) that is shown after the menu.
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateNewProject = () => {
    navigate('/create-new-project');
  };
  const GoBack = () => {
    // Navigate to "/app" which shows HomePage
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-20">
      <div>
        <div className="text-black text-6xl">Select a Project</div>
      </div>
      <div className="flex align-middle justify-center gap-24">
        <Button 
          icon={plusIcon} 
          label="Create New Project" 
          onClick={handleCreateNewProject} 
        />
        <Button 
          icon={open} 
          label="Open Recent Project" 
        />
        <Button 
          icon={open} 
          label="Back" 
          onClick={GoBack} 
        />
      </div>
    </div>
  );
};

// The main App component with routing.
const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* When the app loads, display the menu window */}
        <Route path="/" element={<MenuWindow />} />
        {/* When "Start" is clicked, navigate to the main app content */}
        <Route path="/app" element={<HomePage />} />
        {/* Other routes remain unchanged */}
        <Route path="/create-new-project" element={<NewProjectMenu />} />
        <Route path="/new-project" element={<CreateProjectPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
