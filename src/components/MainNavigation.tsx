import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Database, Brain, ScatterChart, ArrowBigLeft } from 'lucide-react';
import { DataModel } from './data_model/DataModel';
import { SquareButton } from './IconButton';
import { Sidebar } from './Sidebar';
import { UnsupervisedInterface } from './UnsupervisedInterface';
import { ModelInterface } from './modelling/ModelInterface';

const MainNavigation: React.FC = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const startTab = parseFloat(queryParams.get('tab') || '-1');

  const [selectedTab, setSelectedTab] = useState<number>(startTab);
  const [reducedDataPath, setReducedDataPath] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const navigate = useNavigate();

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


  const handleBackClick = () => {
    if (selectedTab > -1) {
      setSelectedTab(-1);
    }
    else {
      navigate('/workflow-selection');
    }
  }

  return (
    <div className="h-screen w-screen flex bg-white">
    <Sidebar
        onHome={handleBackClick}
        buttons={[
        ]}
        selectedTab={selectedTab}
        homeIcon={<ArrowBigLeft />}
      />
      <main className="flex-1 overflow-auto">
        <div className="flex flex-row h-full w-full gap-8 items-center justify-items-center justify-center my-auto">
        {selectedTab === -1 && <>
          <SquareButton title='Data' icon={<Database />} size={250} onClick={() => setSelectedTab(0)} />
          <SquareButton title='Supervised Learning' icon={<Brain />} size={250} onClick={() => setSelectedTab(1)} />
          <SquareButton title='Unsupervised Learning' icon={<ScatterChart />} size={250} onClick={() => setSelectedTab(2)} />
        </>}
        {selectedTab === 0 && <>
          <DataModel/>
        </>}
        {selectedTab === 1 && <>
          <ModelInterface/>
        </>}
        {selectedTab === 2 && <>
          <UnsupervisedInterface dataSrc={reducedDataPath} targetColumn={targetColumn}/>
        </>}
        </div>
      </main>
    </div>
  );
};

export default MainNavigation;