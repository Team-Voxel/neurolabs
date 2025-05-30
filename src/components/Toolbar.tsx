import React from 'react';
import {
  Plus,
  FolderOpen,
  Settings,
  HelpCircle,
  Info,
  Play,
  Search,
  BarChart
} from 'lucide-react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false
}) => {
  return (
    <div className="relative group">
      <div
        className={`
          w-10 h-10 rounded-md flex items-center justify-center
          ${disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
          }
          transition-colors duration-150 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        `}
        onClick={onClick}
        aria-label={label}
      >
        {icon}
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-full mt-2 px-2 py-1 bg-gray-800 text-white text-sm rounded
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    transform -translate-y-1 group-hover:translate-y-0
                    transition-all duration-200 whitespace-nowrap z-50">
        {label}
      </div>
    </div>
  );
};

interface ToolbarProps {
  onNew?: () => void;
  onOpen?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  onInfo?: () => void;
  onTrain?: () => void;
  onInspect?: () => void;
  onEvaluate?: () => void;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNew = () => {},
  onOpen = () => {},
  onSettings = () => {},
  onHelp = () => {},
  onInfo = () => {},
  onTrain = () => {},
  onInspect = () => {},
  onEvaluate = () => {},
  className = ''
}) => {
  return (
    <div 
      className={`
        h-12 w-full bg-white border-b border-gray-200
        flex items-center px-4 gap-8
        ${className}
      `}
      role="toolbar"
      aria-label="Main toolbar"
    >
      {/* Left button group */}
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={<Plus size={20} />}
          label="New"
          onClick={onNew}
        />
        <ToolbarButton
          icon={<FolderOpen size={20} />}
          label="Open"
          onClick={onOpen}
        />
        <ToolbarButton
          icon={<Settings size={20} />}
          label="Settings"
          onClick={onSettings}
        />
        <ToolbarButton
          icon={<HelpCircle size={20} />}
          label="Help"
          onClick={onHelp}
        />
        <ToolbarButton
          icon={<Info size={20} />}
          label="Info"
          onClick={onInfo}
        />
      </div>

      {/* Center button group */}
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={<Play size={20} />}
          label="Train"
          onClick={onTrain}
        />
        <ToolbarButton
          icon={<Search size={20} />}
          label="Inspect"
          onClick={onInspect}
        />
        <ToolbarButton
          icon={<BarChart size={20} />}
          label="Evaluate"
          onClick={onEvaluate}
        />
      </div>
    </div>
  );
};

export default Toolbar;