import React, { useState, useEffect } from 'react';
import { MulticlassScatterPlot } from '../plotting/MulticlassScatter';
import ContourPlot from '../plotting/ContourPlot';
import { Splitter, Flex, Typography, Switch, Checkbox, Slider, Button, Tabs, TabsProps, Divider, Statistic, Card, Popover, Segmented} from 'antd';
import type { ModelTrainingInfo } from '../../backend_api/types';
import Settings from '../settings/Settings';
import { SettingControl as SettingControlType, SelectOption } from '../settings/types';
import { trainModelSimple } from '../../backend_api/data_api';
import { PlotlyHeatmap } from '../plotting/BoxHeat';
import { PiQuestionBold } from 'react-icons/pi';

interface ModelProps {
    type: string;
}

export const SupervisedModel: React.FC<ModelProps> = ({type}) => {
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

    const [isTraining, setIsTraining] = useState<boolean>(false);

    window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        setTempDataFile(tempDataLoc);
    });

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
            visible: type === 'nn' || type === 'svm' || type === 'logistic',
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
            visible: type === 'nn',
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
            visible: type === 'nn' || type === 'gb',
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
            visible: type === 'tree'
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
        // Random Forest & Gradient Boosting
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
            visible: type === 'forest' || type === 'gb',
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
                datasetSize: 1000,
                problemType: 'classify',
            }
            try{
                setIsTraining(true);
                setModelInfo(null);
                const response = await trainModelSimple(config);
                setModelInfo(response);
            } catch (error) {
                console.error('Error training model:', error);
            } finally {
                setIsTraining(false);
            }
        }
        fetchModelInfo();
    }
    
    return (
            <div className='h-full w-full flex flex-col' style={{ minHeight: '100%' }}>
                <div className='flex flex-col h-6/10 w-full'>
                    <Splitter layout='horizontal' style={{ height: '100%' }}>
                        <Splitter.Panel min="60%">
                            <div className='h-full w-full p-2'>
                            {modelInfo ?  <MulticlassScatterPlot X={modelInfo?.decisionBoundary} Y={modelInfo?.predictedClasses} xLabel="X1" yLabel="X2" title='Decision Boundary' /> : 
                            <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                                {isTraining ? <Typography.Title level={4}>Training the model...</Typography.Title> : <Typography.Title level={4}>Train the model to see the decision boundary</Typography.Title>}
                            </div>}
                            </div>
                        </Splitter.Panel>
                        <Splitter.Panel min="30%" size='40%'>
                        {/*Training Parameters*/}
                        <div className='flex-1 flex-col gap-4 items-center mt-4 justify-between pr-4'>
                            <Typography.Title level={4}>Training Parameters</Typography.Title>
                        <Settings controls={trainingParams} />
                        <div className='flex flex-row justify-items-stretch gap-4 my-8 pl-4'>
                            <Button block type="primary" onClick={onClickTrain}>Train Model</Button>
                        </div>
                        </div>
                        </Splitter.Panel>
                    </Splitter>
                </div>
                <div className='h-4/10 w-full border-t-2 border-gray-400 pr-2 flex'>
                {modelInfo ? (
                    <div className='flex-1 flex overflow-hidden'>
                        <Tabs
                            tabPosition='right'
                            className='w-full flex-1 flex'
                            style={{ display: 'flex', flexDirection: 'row' }}
                            items={[
                                {
                                    label: 'Performance Metrics',
                                    key: 'performance',
                                    children: <div className='h-full w-full p-2'><PerformanceMetrics type={type} modelInfo={modelInfo} /></div>
                                },
                                {
                                    label: 'Confusion Matrix',
                                    key: 'confusion',
                                    children: <div className='h-full w-full p-2'><ConfusionMatrix type={type} modelInfo={modelInfo} /></div>
                                },
                                {
                                    label: 'Precision-Recall Curve',
                                    key: 'precision-recall',
                                    children: <div className='h-full w-full p-2'><PrecisionRecallCurve type={type} modelInfo={modelInfo} /></div>
                                }
                            ]}
                        />
                    </div>
                ) : (
                    <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                        <Typography.Title level={4}>Train the model to see the performance metrics</Typography.Title>
                    </div>
                )}
                </div>
            </div>
    )
}



export const PerformanceMetrics: React.FC<{type: string, modelInfo: ModelTrainingInfo}> = ({type, modelInfo}) => {
    return (
        <div className='grid grid-cols-3 gap-4'>
            <Popover content='Type of model used to train the data' title="Model Type" placement='top' mouseEnterDelay={0.5}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Model Type" value={type} valueStyle={{fontSize:'20px'}} />
                </Card>
            </Popover>
            <Popover content={<>This is the accuracy of the model if it always predicted the most common class.<br/> Your model has to beat this accuracy.</>} title="Base Accuracy" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Base Accuracy" valueStyle={{fontSize:'20px'}} value={modelInfo.baseAccuracy * 100} suffix='%' precision={2}/>
                </Card>
            </Popover>
            <Popover content='It is the number of correct predictions divided by the total number of predictions.' title="Accuracy" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Accuracy" valueStyle={{fontSize:'20px'}}  value={modelInfo.accuracy * 100} suffix='%' precision={2}/>
                </Card>
            </Popover>
            <Popover content='It is the number of true positives divided by the number of true positives and false positives.' title="Precision" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Precision" valueStyle={{fontSize:'20px'}}  value={modelInfo.precision * 100} suffix='%' precision={2}/>
                </Card>
            </Popover>
            <Popover content='It is the number of true positives divided by the number of true positives and false negatives.' title="Recall" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="Recall" valueStyle={{fontSize:'20px'}}  value={modelInfo.recall * 100} suffix='%' precision={2}/>
                </Card>
            </Popover>
            <Popover content='It is the harmonic mean of the precision and recall.' title="F1 Score" placement='top' mouseEnterDelay={0.7}>
                <Card variant="borderless" size='default'>
                    <Statistic title="F1 Score" valueStyle={{fontSize:'20px'}}  value={modelInfo.f1Score * 100} suffix='%' precision={2}/>
                </Card>
            </Popover>
        </div>
    )
}

export const ConfusionMatrix: React.FC<{type: string, modelInfo: ModelTrainingInfo}> = ({type, modelInfo}) => {


    return (
        <div className='h-full w-full p-2'>
        <Popover mouseEnterDelay={1} placement='left' content='Y-Axis: Predicted Classes and X-Axis: Actual Classes'>
        <div style={{position: 'absolute', top: '4px', right: '4px'}} onClick={() => {console.log(modelInfo.confusionMatrix)}}>
            <PiQuestionBold className='w-5 h-5'/>
        </div>
        </Popover>
        <PlotlyHeatmap z={modelInfo.confusionMatrix} xLabels={modelInfo.classes} yLabels={modelInfo.classes} colorscale={'RdYlGn'}/>
        </div>
    )
}


export const PrecisionRecallCurve: React.FC<{type: string, modelInfo: ModelTrainingInfo}> = ({}) => {
    return (
        <div>
            <Typography.Title level={4}>Precision-Recall Curve</Typography.Title>
        </div>
    )
}

/**
 * 
 * <ContourPlot
        X={modelInfo.decisionBoundary} 
        zValues={modelInfo.predictedClasses} 
        xLabel='x1' 
        yLabel='x2'
        lineWidth={1.0}
        title='Decision Boundary'
    />
 * 
 * 
 * 
 *             <div className='flex h-full w-8/10 p-2'>
                            {modelInfo ? 
                            (
                                <PerformanceMetrics type={type} modelInfo={modelInfo} />
                            ) :
                            (
                            <div className='flex justify-center items-center h-full w-full border-2 border-dashed border-gray-300 rounded-md'>
                            <Typography.Title level={4}>Train the model to see the performance metrics</Typography.Title>
                        </div>)
                        }
                        </div>
                        <div className='flex h-full w-2/10 py-2 mr-2'>
                            <Segmented options={['Performance Metrics', 'Confusion Matrix', 'Precision-Recall Curve']} vertical block />
                        </div>
 */