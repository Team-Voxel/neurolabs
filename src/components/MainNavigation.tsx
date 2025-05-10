import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Database, Brain, Cpu } from 'lucide-react';
import Canvas from "./nodes/Canvas";
import { DataModel } from './data_model/DataModel';
import { ReactFlowProvider } from "@xyflow/react";

interface NavButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  isSelected?: boolean;
  onClick: () => void;
  isHome?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  tooltip,
  isSelected,
  onClick,
  isHome = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative group w-full flex items-center justify-center
        ${isHome ? 'h-[60px]' : 'h-[48px]'}
        ${isSelected ? 'bg-gray-400' : 'hover:bg-gray-300'}
        transition-colors duration-200
      `}
      aria-label={tooltip}
    >
      <div className={`text-${isSelected ? 'gray-800' : 'gray-600'}`}>
        {icon}
      </div>
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    transform -translate-x-1 group-hover:translate-x-0
                    transition-all duration-200 whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
};

const MainNavigation: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number | null>(0);
  const navigate = useNavigate();
  const handleHomeClick = () => {
    navigate('/');
  };

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
            <>
                <ReactFlowProvider>
                <Canvas />
                </ReactFlowProvider>
            </>
        );
      case 2:
        return <div className="p-6"><h1 className="text-2xl font-bold">Inference Settings</h1></div>;
      default:
        return <div className="p-6"><h1 className="text-2xl font-bold">Select a tab</h1></div>;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-white">
      <nav className="w-[60px] bg-gray-100 flex flex-col border-r border-gray-200">
        <NavButton
          icon={<Home size={40} />}
          tooltip="Home"
          onClick={handleHomeClick}
          isHome
        />
        <div className="h-px bg-gray-200 w-full" />
        <NavButton
          icon={<Database size={32} />}
          tooltip="Data"
          isSelected={selectedTab === 0}
          onClick={() => setSelectedTab(0)}
        />
        <NavButton
          icon={<Brain size={32} />}
          tooltip="Model"
          isSelected={selectedTab === 1}
          onClick={() => setSelectedTab(1)}
        />
        <NavButton
          icon={<Cpu size={32} />}
          tooltip="Inference"
          isSelected={selectedTab === 2}
          onClick={() => setSelectedTab(2)}
        />
      </nav>
      <main className="flex-1 overflow-auto">
        {getContent()}
      </main>
    </div>
  );
};

export default MainNavigation;