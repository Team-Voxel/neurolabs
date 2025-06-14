import React from 'react';
import { Home } from 'lucide-react';
import { Tooltip } from 'antd';

interface SidebarButton {
    label: string;
    icon: JSX.Element;
    callback: () => void;
  }
  
  interface SidebarProps {
    onHome: () => void;
    buttons: SidebarButton[];
    selectedTab?: number; // Optional prop to highlight selected tab
  }
  
  export const Sidebar: React.FC<SidebarProps> = ({ onHome, buttons, selectedTab = -1 }) => {
    return (
      <div className="w-[60px] h-screen bg-white border-r-2 border-gray-200 shadow-lg flex flex-col py-4">
        {/* Home Button - Always at top */}
        <div className="flex justify-center mb-4">
          <div
            onClick={onHome}
            className="p-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 
                       transition-all duration-200 hover:scale-110 transform
                       shadow-md hover:shadow-lg group"
            title="Home"
          >
            <Home size={20} className="group-hover:scale-105 transition-transform duration-200" />
          </div>
        </div>
  
        {/* Separator */}
        <div className="h-px bg-gray-200 mx-3 mb-4"></div>
  
        {/* Dynamic Buttons */}
        <div className="flex flex-col gap-3 items-center">
          {buttons.map((button, index) => (
            <Tooltip key={index} title={button.label} placement="right" mouseEnterDelay={0.5}>
            <div
              key={index}
              onClick={button.callback}
              className={`p-3 rounded-xl bg-gray-100 hover:bg-gray-200 
                         transition-all duration-200 hover:scale-110 transform
                         shadow-sm hover:shadow-md 
                         ${index === selectedTab ? 'text-blue-600' : 'hover:bg-blue-50 hover:text-blue-600'} 
                          group`}
              title={button.label}
            >
              <div className="group-hover:scale-105 transition-transform duration-200">
                {React.cloneElement(button.icon, { size: 20 })}
              </div>
            </div>
            </Tooltip>
          ))}
        </div>
  
        {/* Bottom spacer to push content up if needed */}
        <div className="flex-1"></div>
      </div>
    );
  };