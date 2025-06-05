import React, { useState, useEffect } from 'react';
import { MulticlassScatterPlot } from '../plotting/MulticlassScatter';
import ContourPlot from '../plotting/ContourPlot';
import { Splitter, Flex, Typography, Switch, Checkbox, Slider, Button, Tabs, TabsProps, Divider, Statistic, Card} from 'antd';
import type { ModelTrainingInfo } from '../../backend_api/types';
import Settings from '../../components/settings/Settings';
import { SettingControl as SettingControlType, SelectOption } from '../../components/settings/types';
import { trainModelSimple } from '../../backend_api/data_api';

interface ModelProps {
    type: string;
}

export const Model: React.FC<ModelProps> = ({type}) => {
    const [modelInfo, setModelInfo] = useState<ModelTrainingInfo | null>(null);
    const [epochs, setEpochs] = useState<number>(100);
    const [batchSize, setBatchSize] = useState<number>(32);
    const [learningRate, setLearningRate] = useState<number>(0.001);
    const [regularization, setRegularization] = useState<string>('l2');
    const [kernel, setKernel] = useState<string>('rbf');
    const [C, setC] = useState<number>(1.0);
    const [maxDepth, setMaxDepth] = useState<number>(3);
    const [criterion, setCriterion] = useState<string>('gini');
    const [nNeighbors, setNNeighbors] = useState<number>(5);
    const [metric, setMetric] = useState<string>('euclidean');
    const [nEstimators, setNEstimators] = useState<number>(100);
    const [hiddenLayers, setHiddenLayers] = useState<number[]>([28, 16]);
    const [activation, setActivation] = useState<string>('relu');
    const [optimizer, setOptimizer] = useState<string>('adam');

    const [tempDataFile, setTempDataFile] = useState<string>('');
    window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        setTempDataFile(tempDataLoc);
    });

    const fetchModelInfo = async () => {
        const response = await fetch(`/api/models/${type}`);
        const data = await response.json();
        setModelInfo(data);
    }

    const trainingParams: SettingControlType[] = [
        {
            id: 'epochs',
            label: 'Epochs',
            type: 'slider',
            value: epochs,
            min: 1,
            max: 1000,
            step: 1,
            onChange: (value) => setEpochs(value),
            visible: true,
        },
        {
            id: 'batchSize',
            label: 'Batch Size',
            type: 'slider',
            value: batchSize,
            min: 16,
            max: 256,
            step: 16,
            onChange: (value) => setBatchSize(value),
            visible: true,
        },
        {
            id: 'learningRate',
            label: 'Learning Rate',
            type: 'slider',
            value: learningRate,
            min: 0.0001,
            max: 0.1,
            step: 0.0001,
            tooltip: 'The learning rate for the model',
            onChange: (value) => setLearningRate(value),
            visible: true,
        },
        // Logistic Regression
        {
            id: 'regularization',
            label: 'Regularization',
            type: 'select',
            value: regularization,
            options: [{
                label: 'L1',
                value: 'l1'
            }, {
                label: 'L2',
                value: 'l2'
            }, {
                label: 'Elastic Net',
                value: 'elasticnet'
            }],
            tooltip: 'The regularization for the model',
            onChange: (value) => setRegularization(value),
            visible: type === 'logistic',
        },
        // SVC
        {
            id: 'kernel',
            label: 'Kernel',
            type: 'select',
            value: kernel,
            options: [{
                label: 'Linear',
                value: 'linear'
            }, {
                label: 'RBF',
                value: 'rbf'
            }, {
                label: 'Sigmoid',
                value: 'sigmoid'
            }, {
                label: 'Polynomial',
                value: 'poly'
            }],
            tooltip: 'The kernel for the model',
            onChange: (value) => setKernel(value),
            visible: type === 'svm',
        },
        {
            id: 'C',
            label: 'C',
            type: 'number',
            value: C,
            min: 0.0,
            max: 10.0,
            step: 0.1,
            tooltip: 'The regularization parameter for the model',
            onChange: (value) => setC(value),
            visible: type === 'svm',
        },
        // Decision Tree
        {
            id: 'maxDepth',
            label: 'Max Depth',
            type: 'number',
            value: maxDepth,
            min: 1,
            max: 20,
            step: 1,
            tooltip: 'The max depth for the model',
            onChange: (value) => setMaxDepth(value),
            visible: type === 'tree' || type === 'forest'
        },
        {
            id: 'criterion',
            label: 'Criterion',
            type: 'select',
            value: criterion,
            options: [{
                label: 'Gini',
                value: 'gini'
            }, {
                label: 'Entropy',
                value: 'entropy'
            }],
            tooltip: 'The criterion for the model',
            onChange: (value) => setCriterion(value),
            visible: type === 'tree' || type === 'forest'
        },
        // KNN
        {
            id: 'nNeighbors',
            label: 'N Neighbors',
            type: 'number',
            value: nNeighbors,
            min: 1,
            max: 20,
            step: 1,
            tooltip: 'The number of neighbors for the model',
            onChange: (value) => setNNeighbors(value),
            visible: type === 'knn',
        },
        {
            id: 'metric',
            label: 'Metric',
            type: 'select',
            value: metric,
            options: [{
                label: 'Euclidean',
                value: 'euclidean'
            }, {
                label: 'Manhattan',
                value: 'manhattan'
            }, {
                label: 'Minkowski',
                value: 'minkowski'
            }],
            tooltip: 'The metric for the model',
            onChange: (value) => setMetric(value),
            visible: type === 'knn',
        },
        // Random Forest
        {
            id: 'nEstimators',
            label: 'N Estimators',
            type: 'number',
            value: nEstimators,
            min: 1,
            max: 512,
            step: 1,
            tooltip: 'The number of estimators for the model',
            onChange: (value) => setNEstimators(value),
            visible: type === 'forest',
        },
        // Neural Network
        {
            id: 'hiddenLayers',
            label: 'Hidden Layers',
            type: 'list',
            value: hiddenLayers,
            onChange: (value) => setHiddenLayers(value),
            visible: type === 'nn',
        },
        {
            id: 'activation',
            label: 'Activation',
            type: 'select',
            value: activation,
            options: [{
                label: 'ReLU',
                value: 'relu'
            }, {
                label: 'Sigmoid',
                value: 'sigmoid'
            }, {
                label: 'Tanh',
                value: 'tanh'
            }, {
                label: 'Leaky ReLU',
                value: 'leakyrelu'
            }],
            tooltip: 'The activation for the model',
            onChange: (value) => setActivation(value),
            visible: type === 'nn',
        },
        {
            id: 'optimizer',
            label: 'Optimizer',
            type: 'select',
            value: optimizer,
            options: [{
                label: 'Adam',
                value: 'adam'
            }, {
                label: 'SGD',
                value: 'sgd'
            }],
            tooltip: 'The optimizer for the model',
            onChange: (value) => setOptimizer(value),
            visible: type === 'nn',
        }
    ];
    
    const onClickTrain = () => {
        console.log('Training the model');

        const fetchModelInfo = async () => {
            const config: Record<string, any> = {
                model_type: type,
                epochs: epochs,
                batchSize: batchSize,
                learningRate: learningRate,
                regularization: regularization,
                kernel: kernel,
                C: C,
                maxDepth: maxDepth,
                criterion: criterion,
                nNeighbors: nNeighbors,
                metric: metric,
                nEstimators: nEstimators,
                hiddenLayers: hiddenLayers,
                activation: activation,
                optimizer: optimizer,
                wfDir: tempDataFile,
            }
            try{
                const response = await trainModelSimple(config);
                setModelInfo(response);
            } catch (error) {
                console.error('Error training model:', error);
            }
        }
        fetchModelInfo();
        console.log(modelInfo?.confusionMatrix)
        console.log('Model trained');
    }
    
    return (
            <div className='h-full w-full flex flex-col' style={{ minHeight: '100%' }}>
                <Splitter layout="vertical" style={{ height: '100%' }}>
                    <Splitter.Panel min="50%">
                        <Splitter layout='horizontal' style={{ height: '100%' }}>
                            <Splitter.Panel min="60%">
                                <div className='h-full w-full'>
                                {modelInfo ? <ContourPlot X={modelInfo.decisionBoundary} zValues={modelInfo.predictedClasses} xLabel='x1' yLabel='x2'/> : 
                                <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                                    <Typography.Title level={4}>Train the model to see the decision boundary</Typography.Title>
                                </div>}
                                </div>
                            </Splitter.Panel>
                            <Splitter.Panel min="30%">
                            {/*Training Parameters*/}
                            <div className='flex-1 flex-col gap-4 items-center mt-4 justify-between pr-4'>
                            <Settings controls={trainingParams} />
                            <div className='flex flex-row justify-items-stretch gap-4 mt-8'>
                                <Button block type="primary" onClick={onClickTrain}>Train Model</Button>
                            </div>
                            </div>
                            </Splitter.Panel>
                        </Splitter>
                    </Splitter.Panel>
                    <Splitter.Panel max="40%" min='20%'>
                        <div className='h-full w-1/2'>
                            {modelInfo ? 
                            (
                                <div className='grid grid-cols-3 md:grid-cols-4 gap-4'>
                                    <Card variant="borderless" size='small'>
                                        <Statistic
                                            title="Model Type"
                                            value={type}
                                        />
                                    </Card>
                                    <Card variant="borderless" size='small'>
                                        <Statistic title="Base Accuracy" valueStyle={{fontSize:'20px'}} value={modelInfo.baseAccuracy * 100} suffix='%' precision={2}/>
                                    </Card>
                                    <Card variant="borderless" size='small'>
                                        <Statistic title="Accuracy" valueStyle={{fontSize:'20px'}}  value={modelInfo.accuracy * 100} suffix='%' precision={2}/>
                                    </Card>
                                    <Card variant="borderless" size='small'>
                                        <Statistic title="Precision" valueStyle={{fontSize:'20px'}}  value={modelInfo.precision * 100} suffix='%' precision={2}/>
                                    </Card>
                                    <Card variant="borderless" size='small'>
                                        <Statistic title="Recall" valueStyle={{fontSize:'20px'}}  value={modelInfo.recall * 100} suffix='%' precision={2}/>
                                    </Card>
                                    <Card variant="borderless" size='small'>
                                        <Statistic title="F1 Score" valueStyle={{fontSize:'20px'}}  value={modelInfo.f1Score * 100} suffix='%' precision={2}/>
                                    </Card>
                                </div>
                            ) :
                            (
                            <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                            <Typography.Title level={4}>Train the model to see the performance metrics</Typography.Title>
                        </div>)
                        }
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </div>
    )
}