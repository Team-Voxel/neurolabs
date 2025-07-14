import React, { useEffect } from 'react';
import { Typography, Card, Tooltip, Flex, message } from 'antd';

import Stepper, { Step } from '../HorizontalStepper';
import { AlgorithmSelection, EvaluationInterface, ParameterInterface, TrainInterface, InferenceInterface } from './Steps';
import { DatasetMetadata, ModelTrainingInfo } from '../../backend_api/types';
import { trainAndSaveModel } from '../../backend_api/data_api';
import { Workflow } from '../../AppState';

export interface ModelInterfaceProps {
}

export const ModelInterface: React.FC<ModelInterfaceProps> = () => {
    const [currentWf, setCurrentWf] = React.useState<Workflow | null>(null)
    const [trainingData, setTrainingData] = React.useState<ModelTrainingInfo | null>(null);
    const [datasetMeta, setDatasetMeta] = React.useState<DatasetMetadata | null>(null);
    const [currentStep, setCurrentStep] = React.useState(0);
    const [algorithm, setAlgorithm] = React.useState<string>('svm');
    const [problemType, setProblemType] = React.useState<string>('classify');
    const [modelParameters, setModelParameters] = React.useState<Record<string, any>>({});
    const [trainingEpochs, setTrainingEpochs] = React.useState<number>(100);
    const [wfDir, setWfDir] = React.useState<string>('');

    const onStepChange = (stepIndex: number) => {
        setCurrentStep(stepIndex);
    };

    const onAlgorithmChange = (newAlgorithm: string) => {
        setAlgorithm(newAlgorithm);
        setModelParameters({}); // Reset parameters when algorithm changes
        setCurrentStep(1);
    };

    const onClickTrain = (epochs: number) => {
        setTrainingEpochs(epochs);
        setState('training');
        handleTrainModel();
    }

    const onParametersChange = (parameters: Record<string, any>) => {
        setModelParameters(parameters);
        setState('ready');
    };

    const [state, setState] = React.useState<'ready' | 'training' | 'trained'>('ready');

    useEffect(() => {
        window.stateAPI.getAppState().then(({ current }) => {
            if (current) {
                setCurrentWf(current);
                setProblemType(current.problemType || 'classify');
                setState('ready');
                setWfDir(current.wfDir);
            }
        }).catch((error) => {
            console.error('Error fetching app state:', error);
        });

        window.stateAPI.getDatasetMetadata().then((meta) => {
            setDatasetMeta(meta);
        }).catch(error => {
            message.error('Failed to load dataset metadata.');
        })

        window.fsAPI.readFile(`${wfDir}\\${algorithm}_data.json`).then((data) => {
            const parsedData = JSON.parse(data) as ModelTrainingInfo;
            setTrainingData(parsedData);
            message.success('Loaded latest training data for the selected algorithm.');
        }).catch(() => {});
    }, [algorithm]);

    const handleTrainModel = () => {
        const request = async () => {
            try {
                const response = await trainAndSaveModel({
                    modelType: algorithm,
                    problemType: problemType,
                    parameters: modelParameters,
                    epochs: trainingEpochs,
                    wfDir: wfDir,
                });
                setTrainingData(response);
                message.success('Model trained and saved successfully.');
                setState('trained');
            } catch (error) {
                console.error('Error training model:', error);
                setState('ready');
                message.error('Failed to train the model. Please check the console for details.');
            }
        }
        request().then(() => {}).catch((error) => {
            message.error('An error occurred while training the model.' + error.message);
        });
    }

    const steps : Step[] = [
        {
            id: 'algorithm',
            title: 'Algorithm ',
            content: <AlgorithmSelection onAlgorithmChange={setAlgorithm} problemType={problemType as 'classify' | 'regress'} />  
        },
        {
            id: 'parameters',
            title: 'Parameter Selection',
            content: <ParameterInterface model_type={algorithm} onChange={onParametersChange} />
        },
        {
            id: 'training',
            title: 'Training',
            content: <TrainInterface onClickTrain={onClickTrain} state={state} trainingData={trainingData} modelType={algorithm}/>
        },
        {
            id: 'evaluation',
            title: 'Evaluation',
            content: <EvaluationInterface trainingData={trainingData} />
        },
        {
            id: 'inference',
            title: 'Make Predictions',
            content: <InferenceInterface datasetData={datasetMeta} workflow={currentWf} modelType={algorithm}/>
        }
    ];
    
    return (
        <div className='flex h-screen w-screen'>
            <Stepper currentStep={currentStep} steps={steps} onStepChange={(value) => onStepChange(value)}/>
        </div>
    );
};