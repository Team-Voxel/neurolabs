import AwesomeSliedr from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';

import React, { useEffect } from 'react';
import { Typography, Card, Tooltip, Flex } from 'antd';

import Stepper, { Step } from '../HorizontalStepper';
import { AlgorithmSelection, ParameterInterface, TrainInterface } from './Steps';

export interface ModelInterfaceProps {
}

export const ModelInterface: React.FC<ModelInterfaceProps> = () => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [algorithm, setAlgorithm] = React.useState<string>('svm');
    const [problemType, setProblemType] = React.useState<string>('classify');
    const onStepChange = (stepIndex: number) => {
        setCurrentStep(stepIndex);
    };
    const [state, setState] = React.useState<'ready' | 'training' | 'trained'>('ready');

    useEffect(() => {
        window.stateAPI.getAppState().then(({ current }) => {
            if (current) {
                setProblemType(current.problemType || 'classify');
                setState('ready');
            }
        }).catch((error) => {
            console.error('Error fetching app state:', error);
        });
    }, []);

    const steps : Step[] = [
        {
            id: 'algorithm',
            title: 'Algorithm ',
            content: <AlgorithmSelection onAlgorithmChange={setAlgorithm} problemType={problemType as 'classify' | 'regress'} />  
        },
        {
            id: 'parameters',
            title: 'Parameter Selection',
            content: <ParameterInterface model_type={algorithm} />
        },
        {
            id: 'training',
            title: 'Training',
            content: <TrainInterface onClickTrain={() => setState('trained')} state={state} />
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
        },
        {
            id: 'inference',
            title: 'Make Predictions',
            content: <div>Make predictions</div>
        }
    ];
    
    return (
        <div className='flex h-screen w-screen'>
            <Stepper currentStep={currentStep} steps={steps} onStepChange={(value) => onStepChange(value)}/>
        </div>
    );
};