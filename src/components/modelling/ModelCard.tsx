import React, { useState } from 'react';
import { Typography } from 'antd';
import {PiNetwork } from 'react-icons/pi';

export interface ModelCardProps {
    modelName: string;
    modelType: string;
    isSelected: boolean;
    onSelect: () => void;
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

export const ModelCard : React.FC<ModelCardProps> = ({modelName, modelType, isSelected, onSelect}) => {
    return (
        <div className={`flex flex-row ${isSelected ? 'border-2 border-blue-500' : 'border-2 border-gray-300'}`} onClick={onSelect}>
            {/* Icon */}
            {modelIcons[modelType]}
            <div className='flex flex-col w-full h-full'>
                <Typography.Title level={2}>{modelName}</Typography.Title>
                <Typography.Text>{modelType}</Typography.Text>
            </div>
        </div>
    )
}