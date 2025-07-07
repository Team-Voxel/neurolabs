import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { ArrowBigLeft, Scaling, Variable, Gauge, SquareFunction, ScanSearch } from 'lucide-react';

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
    const model = queryParams.get('model') || 'logistic';

    const [selectedTab, setSelectedTab] = useState<string>(startTab);
    const navigate = useNavigate();

    const sidebarButtons = [
        {
          label: 'Preprocessing',
          icon: <Scaling size={32} />,
          callback: () => setSelectedTab('preprocessing'),
        },
        {
          label: 'Select Parameters',
          icon: <Variable size={32} />,
          callback: () => setSelectedTab('parameters'),
        },
        {
          label: 'Model Tuning',
          icon: <ScanSearch size={32} />,
          callback: () => setSelectedTab('tuning'),
        },  
        {
          label: 'Performance',
          icon: <Gauge size={32} />,
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