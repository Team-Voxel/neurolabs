import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Database, Brain, Cpu, ChartScatter, ScatterChart } from 'lucide-react';
import { DataModel } from './data_model/DataModel';
import { NNModel } from './modelling/NNModel';
import { ModelContext } from './modelling/ModelContext';
import { Sidebar } from './Sidebar';
import { UnsupervisedInterface } from './UnsupervisedInterface';

const MainNavigation: React.FC = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const startTab = parseInt(queryParams.get('tab') || '0', 0);

  const [selectedTab, setSelectedTab] = useState<number>(startTab);
  const [reducedDataPath, setReducedDataPath] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const navigate = useNavigate();
  const handleHomeClick = () => {
    navigate('/');
  };

  useEffect(() => {
    window.stateAPI.getAppState().then(({ current }) => {
      if (current) {
        setReducedDataPath(current.wfDir + '\\reduced_data.csv');
        setTargetColumn(current.target);
      } else {
        setReducedDataPath('');
      }
    }).catch((error) => {
      console.error('Error fetching app state:', error);
    });
  }
  , [navigate]);

  const getContent = () => {
    switch (selectedTab) {
      case 0:
        return (
            <>
              <DataModel/>
            </>
        );
      case 1:
        return (
            <ModelContext/>
        );
      case 2:
        return <UnsupervisedInterface dataSrc={reducedDataPath} targetColumn={targetColumn}/>;
      default:
        return <div className="p-6"><h1 className="text-2xl font-bold">Select a tab</h1></div>;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white">
      <Sidebar
        onHome={handleHomeClick}
        buttons={[
          {
            label: 'Data',
            icon: <Database size={32} />,
            callback: () => setSelectedTab(0),
          },
          {
            label: 'Supervised Learning',
            icon: <Brain size={32} />,
            callback: () => setSelectedTab(1),
          },
          {
            label: 'Unsupervised Learning',
            icon: <ScatterChart size={32} />,
            callback: () => setSelectedTab(2),
          },
        ]}
        selectedTab={selectedTab}
      />
      <main className="flex-1 overflow-auto">
        {getContent()}
      </main>
    </div>
  );
};

export default MainNavigation;