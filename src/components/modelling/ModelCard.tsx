import React from 'react';
import { Typography , Tooltip, Flex} from 'antd';
import {PiNetwork } from 'react-icons/pi';
import { Trash2, RotateCcw } from 'lucide-react';


export interface ModelCardProps {
    modelName: string;
    modelType: string;
    isSelected: boolean;
    height?: number;
    width?: number;
    onSelect: (name: string) => void;
    onRetrain: (name: string) => void;
    onDelete: (name: string) => void;
}

const modelIcons = {
    'linear': <PiNetwork className='w-10 h-10' />,
    'logistic': <PiNetwork className='w-10 h-10' />,
    'tree': <PiNetwork className='w-10 h-10' />,
    'forest': <PiNetwork className='w-10 h-10' />,
    'gb': <PiNetwork className='w-10 h-10' />,
    'svm': <PiNetwork className='w-10 h-10' />,
    'knn': <PiNetwork className='w-10 h-10' />,
    'nb': <PiNetwork className='w-10 h-10' />,
    'nn': <PiNetwork className='w-10 h-10' />,
}

export const ModelCard: React.FC<ModelCardProps> = ({
    modelName,
    modelType,
    isSelected,
    height = 100,
    onSelect,
    onRetrain,
    onDelete
  }) => {

    const handleSelect = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(modelName);
    };

    const handleRetrain = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRetrain(modelName);
    };
  
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(modelName);
    };
  
    return (
      <div 
        className={`
          relative flex flex-col gap-4 p-6 rounded-xl cursor-pointer
          min-h-32 min-w-48 transition-all duration-300 ease-in-out transform
          ${isSelected 
            ? 'bg-blue-50 border-2 border-blue-500 shadow-lg scale-105 ring-4 ring-blue-200 ring-opacity-50' 
            : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-gray-300 hover:scale-102'
          }
          hover:shadow-2xl  
          group
        `}
        style={{ height: `${height}px` }}
        onClick={handleSelect}
      >
        {/* Header with Icon and Actions */}
        <div className="flex justify-between items-start">
          <div className={`
            transition-transform duration-300 
            ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
          `}>
            {modelIcons[modelType] || modelIcons['default']}
          </div>
          
          {/* Action Buttons */}
          <div className={`
            flex gap-2 opacity-0 transition-opacity duration-300
            ${isSelected ? 'opacity-100' : 'group-hover:opacity-100'}
            `}>
            <Tooltip title="Retrain" placement="top">
            <div
              onClick={handleRetrain}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 
                         transition-colors duration-200 hover:scale-110 transform"
              title="Retrain Model"
            >
              <RotateCcw size={16} />
            </div>
            </Tooltip>
            <Tooltip title="Delete" placement="top">
            <div
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 
                         transition-colors duration-200 hover:scale-110 transform"
              title="Delete Model"
            >
              <Trash2 size={16} />
            </div>
            </Tooltip>
          </div>
        </div>
  
        {/* Model Name */}
        <div className="flex-1 flex items-center justify-center">
          <Typography.Title 
            level={3} 
            className={`
              text-center transition-colors duration-300 
              ${isSelected 
                ? 'text-blue-700' 
                : 'text-gray-800 group-hover:text-gray-900'
              }
            `}
          >
            {modelName}
          </Typography.Title>
        </div>
  
        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
  
        {/* Hover Glow Effect */}
        <div className={`
          absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
          ${isSelected 
            ? 'bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-100' 
            : 'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'
          }
          pointer-events-none
        `}></div>
      </div>
    );
  };
  
  export interface ActionCardProps {
    icon: JSX.Element;
    title: string;
    description: string;
    isTrained: boolean; // true = show "Retrain", false = show "Train"
    onTrain: () => void;
    onMetrics: () => void;
    onInfer: () => void;
  }

  const boxStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };
  
  export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    isTrained,
    onTrain,
  }) => {
    const handleTrain = (e: React.MouseEvent) => {
      e.stopPropagation();
      onTrain();
    };

    const iconSize = 64; // Default icon size, can be adjusted as needed
  
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md
                      hover:shadow-l hover:border-gray-300
                      transition-all duration-300 ease-in-out transform
                      group max-w -60">
        
        {/* <div className="flex flex-col items-center gap-6"> */}
        <Flex style={boxStyle} justify='space-between' align='center' vertical>
          <div className='flex flex-col items-center justify-center mb-4'>
          
          <div className="flex-1 p-4 transition-transform duration-300 group-hover:scale-105">
          {React.cloneElement(icon, { 
              size: iconSize, 
              className: "flex-1 text-gray-600 group-hover:text-gray-800 transition-colors duration-300" 
            })}
          </div>
  
          {/* Middle Section - Title and Description */}
          <div className="flex-1 min-w-0 items-center text-center ">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-2 
                           group-hover:text-gray-900 transition-colors duration-300
                           truncate">
              {title}
            </h3> */}
            <Typography.Title level={3} style={{userSelect: 'none'}}>{title}</Typography.Title>
            {/* <p className="text-sm text-gray-600 group-hover:text-gray-700 
                          transition-colors duration-300 line-clamp-2">
              {description}
            </p> */}{/* 
            <Typography.Text type="secondary" style={{userSelect: 'none'}}>{description}</Typography.Text> */}
          </div>
          </div>
          {/* Right Section - Action Buttons */}
          <div className="flex flex-row gap-4 flex-shrink-0">
          <div
              onClick={handleTrain}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform
                         ${isTrained 
                           ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                           : 'bg-green-100 hover:bg-green-200 text-green-700'
                         }`}
              title='Make Model'
            >
              <Typography.Text style={{userSelect: 'none'}}>Make Model</Typography.Text>
            </div>
            {/* 
            <Tooltip title={isTrained ? 'Retrain Model' : 'Train Model'} placement="bottom">
            <div
              onClick={handleTrain}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 transform
                         ${isTrained 
                           ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                           : 'bg-green-100 hover:bg-green-200 text-green-700'
                         }`}
              title={isTrained ? 'Retrain Model' : 'Train Model'}
            >
              {isTrained ? <RotateCcw size={iconSize} /> : <Play size={iconSize} />}
            </div>
            </Tooltip>

            <Tooltip title="View Metrics" placement="bottom">
            <div
              onClick={handleMetrics}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700
                         transition-all duration-200 hover:scale-110 transform"
              title="View Metrics"
            >
              <BarChart3 size={iconSize} />
            </div>
            </Tooltip>
  
            <Tooltip title="Make Inference" placement="bottom">
            <div
              onClick={handleInfer}
              className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700
                         transition-all duration-200 hover:scale-110 transform"
              title="Run Inference"
            >
              <Zap size={iconSize} />
            </div>
            </Tooltip> 
            */}
          </div>
          </Flex>
  
        {/* Subtle hover glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                        bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100
                        pointer-events-none">
        </div>
      </div>
    );
  };