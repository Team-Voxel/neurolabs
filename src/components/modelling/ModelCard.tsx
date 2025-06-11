import React, { useState } from 'react';
import { Typography, Card, Tooltip} from 'antd';
import {PiNetwork } from 'react-icons/pi';
import Meta from 'antd/es/card/Meta';
import { SettingOutlined, EllipsisOutlined } from '@ant-design/icons';
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
    width = 100,
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
  


/*
        <div className={`flex flex-row h-${height} w-${width} ${isSelected ? 'border-2 border-blue-500' : 'border-2 border-gray-300'}`} onClick={onSelect}>
            {modelIcons[modelType]}
            <div className='flex flex-col items-center justify-center w-full h-full'>
                <Typography.Title level={2}>{modelName}</Typography.Title>
                <Typography.Text>{modelType}</Typography.Text>
            </div>
        </div>
<Card
    style={{ width: 300 }}
    cover={
      <img
        alt="example"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      />
    }
    actions={[
      <SettingOutlined key="setting" />,
      <EditOutlined key="edit" />,
      <EllipsisOutlined key="ellipsis" />,
    ]}
  >
    <Meta
      avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
      title="Card title"
      description="This is the description"
    />
  </Card>

*/