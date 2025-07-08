import AwesomeSliedr from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';

import React from 'react';
import { Typography, Card, Tooltip, Flex } from 'antd';

import {Stepper, StepperStep} from '../Stepper';

export interface ModelInterfaceProps {
}

export const ModelInterface: React.FC<ModelInterfaceProps> = () => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const steps: StepperStep[] = [
        {
            id: 0,
            title: 'Theory',
            description: 'Learn the theory',
            content: <div>Your content here</div>
        },
        {
            id: 1,
            title: 'Parameter Selection',
            description: 'Select training parameters and Train the model',
            content: <div>Another content here</div>
        },
        {
            id: 2,
            title: 'Evaluate',
            description: 'Evaluate the model based on standard metrics',
            content: <div>More content here</div>
        },
        {
            id: 3,
            title: 'Inference',
            description: 'Make inferences based on the trained model',
            content: <div>More content here</div>
        },
        {
            id: -1,
            title: 'History',
            content: <div>Content</div>
        },
    ]
    return (
        <div>
            <Stepper steps={steps} currentStep={currentStep}/>
        </div>
    );
};