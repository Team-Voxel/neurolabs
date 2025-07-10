import AwesomeSliedr from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';

import React from 'react';
import { Typography, Card, Tooltip, Flex } from 'antd';

import Stepper, { Step } from '../HorizontalStepper';
import { ParameterInterface } from './ParameterInterface';

export interface ModelInterfaceProps {
}

export const ModelInterface: React.FC<ModelInterfaceProps> = () => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [algorithm, setAlgorithm] = React.useState<string>('svm');
    const onStepChange = (stepIndex: number) => {
        setCurrentStep(stepIndex);
    };
    const steps : Step[] = [
        {
            id: 'algorithm',
            title: 'Algorithm Selection',
            content: <div>Algorithm Selection Content</div>
        },
        {
            id: 'parameters',
            title: 'Parameter Selection',
            content: <ParameterInterface model_type={algorithm} />
        },
        {
            id: 'training',
            title: 'Training',
            content: <div>Training Content</div>
        },
        {
            id: 'evaluation',
            title: 'Evaluation',
            content: <div>Evaluation Content</div>
        },
        {
            id: 'results',
            title: 'Results',
            content: <div>Results Content</div>
        }
    ];
    
    return (
        <div className='flex h-screen w-screen'>
            <Stepper currentStep={currentStep} steps={steps} onStepChange={(value) => onStepChange(value)}/>
        </div>
    );
};