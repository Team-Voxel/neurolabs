import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';


export const MainMenu : React.FC = () => {
    const navigate = useNavigate();

    const handlePlayground = () => {
        navigate('/playground');
    };

    const handleExplore = () => {
        navigate('/explore');
    };

    const handleSettings = () => {
        navigate('/settings');
    };

    const handleExit = () => {
        // handle exit logic here, e.g., close the app or navigate to a different route
    };

    return (
        <>
        <div className="flex flex-col justify-center items-center w-25% h-full gap-2 p-4 bg-white border-b border-gray-200 shadow-sm">
            <Button variant="contained" color="primary" className="mb-2" onClick={handlePlayground}>Playground</Button>
            <Button variant="contained" color="primary" className="mb-2" onClick={handleExplore}>Explore</Button>
            <Button variant="contained" color="primary" className="mb-2" onClick={handleSettings}>Settings</Button>
            <Button variant="contained" color="primary" className="mb-2" onClick={handleExit}>Exit</Button>
        </div>
        </>
    );
}

