import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { ArrowBigLeft,BookOpenText, History } from 'lucide-react';
import { Fa1, Fa2, Fa3 } from "react-icons/fa6";

function string_to_number(str: string): number {
    switch (str) {
        case 'parameters':
            return 0;
        case 'tuning':
            return 1;
        case 'metrics':
            return 2; 
        default:
            return -1;
    }
}

export const ModelTrainingWindow: React.FC = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const startTab = queryParams.get('startTab') || 'preprocessing';

    const [selectedTab, setSelectedTab] = useState<string>(startTab);
    const navigate = useNavigate();

    const sidebarButtons = [
        {
          label: 'Theory',
          icon: <BookOpenText size={32} />,
          callback: () => setSelectedTab('theory'),
        },
        {
          label: 'Training History',
          icon: <History size={32} />,
          callback: () => setSelectedTab('history'),
        },
        {
          label: 'Select Parameters',
          icon: <Fa1 size={32} />,
          callback: () => setSelectedTab('parameters'),
        },
        {
          label: 'Model Tuning',
          icon: <Fa2 size={32} />,
          callback: () => setSelectedTab('inference'),
        },  
        {
          label: 'Performance',
          icon: <Fa3 size={32} />,
          callback: () => setSelectedTab('metrics'),
        },
    ]

    return (
        <div className='flex flex-row h-full w-full'>
            <Sidebar onHome={() => navigate('/sandbox')} buttons={sidebarButtons} selectedTab={string_to_number(selectedTab)} homeIcon={<ArrowBigLeft size={40} />}></Sidebar>
            <div className='flex-1'>
                <div className='flex flex-col h-full w-full p-4'>
                    {selectedTab === 'preprocessing' && (
                        <div>
                            <h2 className='text-xl font-bold mb-4'>Preprocessing</h2>
                            {/* Preprocessing content goes here */}
                        </div>
                    )}
                    {selectedTab === 'parameters' && (
                        <div>
                            <h2 className='text-xl font-bold mb-4'>Select Parameters</h2>
                            {/* Parameter selection content goes here */}
                        </div>
                    )}
                    {selectedTab === 'tuning' && (
                        <div>
                            <h2 className='text-xl font-bold mb-4'>Model Tuning</h2>
                            {/* Model tuning content goes here */}
                        </div>
                    )}
                    {selectedTab === 'metrics' && (
                        <div>
                            <h2 className='text-xl font-bold mb-4'>Performance</h2>
                            {/* Performance evaluation content goes here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}