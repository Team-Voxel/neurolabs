import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const MenuWindow: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    
    navigate('/app');
  };

  const handleExplore = () => {
    alert('Explore functionality not implemented yet.');
  };

  const handleExit = () => {     
    if (window && window.electronAPI && typeof window.electronAPI.exitApp === 'function') {
      window.electronAPI.exitApp();
    } else {
      window.close();
    }
  };

  return (
    <div className="menu-window">
      <h1>Menu</h1>
      <div className="button-container">
        <button className="menu-button" onClick={handleStart}>Start</button>
        <button className="menu-button" onClick={handleExplore}>Explore</button>
        <button className="menu-button" onClick={handleExit}>Exit</button>
      </div>
    </div>
  );
};

export default MenuWindow;
