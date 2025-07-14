import React, { useEffect, useReducer, useState } from 'react';
import { Typography, Card, Tooltip, Flex, Button, message } from 'antd';
import { SettingControl } from '../settings/types';
import Settings from '../settings/Settings';
import { BrainCog } from 'lucide-react';
import { CircularProgressBar } from '../ProgressBar';
import { SquareButton } from '../IconButton';
import { useFakeProgress } from '../../lib/fakeProgress';
import InteractiveList from '../InteractiveList';
import {Slider} from '../StyledSlider';
import { DatasetMetadata, ModelTrainingInfo } from '../../backend_api/types';
import { Slider as RangeSlider, Statistic} from 'antd';
import { MulticlassScatterPlot } from '../plotting/MulticlassScatter';
import {LineAreaChart} from '../plotting/LineAreaChart';
import { Workflow } from '../../AppState';
import { ModelType } from './ModelContext';
import { makeInference } from '../../backend_api/data_api';
import { data } from 'react-router-dom';
//import {ReactComponent as SVM } from '../../assets/svm.svg';

export interface AlgorithmSelectionProps {
    onAlgorithmChange: (algorithm: string) => void;
    problemType: 'classify' | 'regress';
}

const descriptions: Record<string, any> = {
    linear_simple: {label:'Linear Regression', desc: 'Predicts continuous values using a linear relationship between features and target. It fits a straight line by minimizing the sum of squared errors between predictions and actual values. Best for simple, low-dimensional data but sensitive to outliers and irrelevant features.'},
    linear_fs: {label:'Linear Regression (with Feature Selection)', desc: 'Adds regularization (Lasso/Ridge) to predict continuous values while automatically shrinking or eliminating unimportant features. Reduces overfitting in high-dimensional data. Lasso zeros weak features; Ridge handles correlated predictors.'},    
    logistic_simple: {label:'Logistic Regression', desc:'Predicts class probabilities (e.g., spam/not-spam) by fitting an S-shaped curve (sigmoid) to linear feature relationships. Simple and interpretable but struggles with complex patterns. Requires scaled features.'},
    logistic_fs: {label:'Logistic Regression (with Feature Selection)', desc: 'Classifies outcomes using regularization (L1/L2) to discard irrelevant features during training. Ideal for high-dimensional data (e.g., text). Lasso forces weak coefficients to zero, simplifying the model.'},
    svm: {label: 'Support Vector Machine', desc:'Finds the optimal hyperplane that maximally separates classes. Uses "support vectors" (critical data points) and kernels (e.g., RBF) for non-linear boundaries. Effective for clear-margin problems but slow on large datasets.'},
    tree: {label:'Decision Tree', desc: 'Builds a flowchart-like structure by splitting data on feature values to minimize impurity (e.g., Gini index). Highly interpretable but prone to overfitting. Use for intuitive, non-linear decisions.'},
    forest: {label: 'Random Forest', desc: 'Ensemble of decision trees trained on random data subsets/features. Averages results to reduce overfitting and boost accuracy. Robust and versatile but less interpretable than single trees.'},
    knn: {label: 'K Nearest Neighbors', desc:'Classifies/regresses based on majority vote or average of the K closest data points. Simple and training-free but computationally heavy for large data. Sensitive to *k* and distance metrics.'},
    gb: {label:'Gradient Boosting', desc:'Sequentially combines weak learners (usually trees), each correcting its predecessor’s errors. High accuracy for structured data but requires careful tuning. XGBoost/LightGBM are popular variants.'},
    nn: {label:'Artificial Neural Network', desc: 'Universal function approximators. They mimics the brain’s neurons using interconnected layers (input/hidden/output). Learns complex patterns via forward passes and backpropagation.'},
    nb: {label:'Naive Bayes Classifier', desc:'Classifies by applying Bayes’ theorem with strong independence assumptions. Fast and effective for text classification but assumes features are independent, which is often not true.'},
}

export const AlgorithmSelection: React.FC<AlgorithmSelectionProps> = ({ onAlgorithmChange, problemType }) => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('svm');
    const onChangeAlgorithm = (algorithm: string) => {
        setSelectedAlgorithm(algorithm);
        onAlgorithmChange(algorithm);
    }

    const algorithms = [
        { id: 'linear_simple', title: 'Linear Regression (Simple)' },
        { id: 'linear_fs', title: 'Linear Regression (Feature Selection)' },
        { id: 'logistic_simple', title: 'Logistic Regression (Simple)' },
        { id: 'logistic_fs', title: 'Logistic Regression (Feature Selection)' },
        { id: 'svm', title: 'Support Vector Machine' },
        { id: 'tree', title: 'Decision Tree' },
        { id: 'forest', title: 'Random Forest' },
        { id: 'knn', title: 'K-Nearest Neighbors' },
        { id: 'gb', title: 'Gradient Boosting' },
        { id: 'nn', title: 'Neural Network' }
    ];


    const filteredAlgorithms = algorithms.filter(algo => {
        if (problemType === 'classify') {
            return algo.id !== 'linear_simple' && algo.id !== 'linear_fs';
        }
        else if (problemType === 'regress') {
            return algo.id !== 'logistic_simple' && algo.id !== 'logistic_fs';
        }
        return true;
    });

    return (
        <div className='flex flex-col items-center justify-center w-full h-full pt-6'>
            <div>
            <Typography.Title level={3}>Select Algorithm</Typography.Title>
            </div>
                
            <div className='flex-1 flex flex-row items-center justify-between w-full h-full'>
                <div className='flex h-full p-2'>
                <InteractiveList items={filteredAlgorithms} onSelect={onChangeAlgorithm} selectedItems={[selectedAlgorithm]}/>
                </div>
                <div className='flex-1 flex flex-col border h-full p-2'>
                    {/* <div>{React.cloneElement(<SVM/>)}</div> */}
                    <div className='flex flex-col gap-2 border-t'>
                        <Typography.Title level={4}>{descriptions[selectedAlgorithm].label}</Typography.Title>
                        <Typography.Text>{descriptions[selectedAlgorithm].desc}</Typography.Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

const modelParameterInitialState: Record<string, Record<string, any>> = {
    linear_simple: {
        useSGD: false,
    },
    linear_fs: {
        loss: 'squared_loss',
        useSGD: false,
        regularization: 'none',
    },
    logistic_simple: {
        useSGD: false,
    },
    logistic_fs: {
        epochs: 1000,
        regularization: 'none',
        alpha: 1,
    },
    svm: {
        kernel: 'rbf',
        C: 1,
        epochs: 1000
    },
    tree: {
        criterion: 'gini',
        maxDepth: 10,
        minSamplesSplit: 2
    },
    forest: {
        criterion: 'gini',
        nEstimators: 100,
        maxDepth: 10,
        minSamplesSplit: 2
    },
    knn: {
        nNeighbors: 5,
        metric: 'euclidean'
    },
    gb: {
        nEstimators: 100,
        loss: 'squared_error',
        maxDepth: 3,
        learningRate: 0.1
    },
    nn: {
        hiddenLayers: [8, 16, 8],
        activation: 'relu',
        optimizer: 'adam',
        learningRate: 0.001,
        epochs: 1000,
        batchSize: 32
    }
};

export const ParameterInterface : React.FC<{ model_type: string, onChange: (parameters: Record<string, any>) => void }> = ({model_type, onChange}) => {
    
    const [controls, setControls] = useState<Record<string, Record<string, any>>>(modelParameterInitialState);
    const setParam = (model: string, param: string, value: any) => {
        setControls(prev => ({
            ...prev,
            [model]: {
              ...prev[model],
              [param]: value,
            },
        }));
        onChange(controls[model]);
    }
    const getParam = (model: string, param: string) => {
        return controls[model] ? controls[model][param] : undefined;
    }

    const modelParameters : Record<string, SettingControl[]> = {
        linear_simple: [
            {
                id: 'useSGD',
                label: 'Use Stochastic Gradient Descent',
                type: 'switch',
                value: controls['linear_simple']['useSGD'],
                onChange: (value) => setParam('linear_simple', 'useSGD', value),
                tooltip: 'Whether to use stochastic gradient descent for finding weights (Works best with a lot of data)'
            },
        ],
        linear_fs: [
            {
                id: 'loss',
                label: 'Loss',
                type: 'select',
                options: [
                    {value: 'squared_loss', label: 'Squared Error'},
                    {value: 'huger', label: 'Huber'},
                ],
                onChange: (value) => setParam('linear_fs', 'loss', value),
                value: controls['linear_fs']['loss'],
                tooltip: 'Loss function'
            },
            {
                id: 'useSGD',
                label: 'Use Stochastic Gradient Descent',
                type: 'switch',
                value: controls['linear_fs']['useSGD'],
                onChange: (value) => setParam('linear_fs', 'useSGD', value),
                tooltip: 'Whether to use stochastic gradient descent for finding weights (Works best with a lot of data)'
            },
            {
                id: 'regularization',
                label: 'Regularization',
                type: 'select',
                options: [
                    {value: 'ridge', label: 'L1 Regularization'},
                    {value: 'lasso', label: 'L2 Regularization'},
                    {value: 'elasticnet', label: 'Elastic Net (L1 + L2)'},
                    {value: 'lars', label: 'Least Angle Regression (LARS)'},
                    {value: 'none', label: 'None'},
                ],
                value: controls['linear_fs']['regularization'],
                onChange: (value) => setParam('linear_fs', 'regularization', value),
                tooltip: 'Regularization technique to apply',
                visible: getParam('linear_fs', 'loss') !== 'huber'
            },
            {
                id: 'alpha',
                label: 'Alpha',
                type: 'slider',
                min: 0,
                max: 1,
                step: 0.01,
                value: controls['linear_fs']['alpha'] || 0.01,
                onChange: (value) => setParam('linear_fs', 'alpha', value),
                tooltip: 'Regularization strength (0.01 by default)',
                visible: getParam('linear_fs', 'regularization') !== 'none'
            },
        ],
        logistic_simple: [
            {
                id: 'useSGD',
                label: 'Use Stochastic Gradient Descent',
                type: 'switch',
                value: controls['logistic_simple']['useSGD'],
                onChange: (value) => setParam('logistic_simple', 'useSGD', value),
                tooltip: 'Whether to use stochastic gradient descent for finding weights (Works best with a lot of data)'
            },
        ],
        logistic_fs: [
            {
                id: 'regularization',
                label: 'Regularization',
                type: 'select',
                options: [
                    {value: 'l1', label: 'L1 Regularization'},
                    {value: 'l2', label: 'L2 Regularization'},
                    {value: 'elasticnet', label: 'Elastic Net (L1 + L2)'},
                    {value: 'none', label: 'None'},
                ],
                value: controls['logistic_fs']['regularization'],
                onChange: (value) => setParam('logistic_fs', 'regularization', value),
                tooltip: 'Regularization technique to apply'
            },
            {
                id: 'alpha',
                label: 'Regularization Strength',
                type: 'slider',
                min: 0.01,
                max: 10,
                step: 0.1,
                value: controls['logistic_fs']['alpha'] || 1,
                onChange: (value) => setParam('logistic_fs', 'alpha', value),
                tooltip: 'Regularization strength (0.01 by default)',
                visible: getParam('logistic_fs', 'regularization') !== 'none'
            }
        ],
        svm: [
            {
                id: 'kernel',
                label: 'Kernel',
                type: 'select',
                options: [
                    {value: 'linear', label: 'Linear'},
                    {value: 'poly', label: 'Polynomial'},
                    {value: 'rbf', label: 'Radial Basis Function (RBF)'},
                    {value: 'sigmoid', label: 'Sigmoid'},
                ],
                value: controls['svm']['kernel'],
                onChange: (value) => setParam('svm', 'kernel', value),
                tooltip: 'Kernel function to use for SVM'
            },
            {
                id: 'C',
                label: 'C (Regularization)',
                type: 'slider',
                min: 0.01,
                max: 10,
                step: 0.1,
                value: controls['svm']['C'] || 1,
                onChange: (value) => setParam('svm', 'C', value),
                tooltip: 'Regularization parameter (C) for SVM'
            },
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['svm']['epochs'] || 1000,
                onChange: (value) => setParam('svm', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            }
        ],
        tree: [
            {
                id: 'criterion',
                label: 'Criterion',
                type: 'select',
                options: [
                    {value: 'gini', label: 'Gini Impurity'},
                    {value: 'entropy', label: 'Entropy'},
                ],
                value: controls['tree']['criterion'],
                onChange: (value) => setParam('tree', 'criterion', value),
                tooltip: 'Criterion to measure the quality of a split'
            },
            {
                id: 'maxDepth',
                label: 'Max Depth',
                type: 'number',
                min: 1,
                max: 100,
                step: 1,
                value: controls['tree']['maxDepth'] || 10,
                onChange: (value) => setParam('tree', 'maxDepth', value),
                tooltip: 'Maximum depth of the tree (10 by default)',
            },
            {
                id: 'minSamplesSplit',
                label: 'Min Samples Split',
                type: 'number',
                min: 2,
                max: 100,
                step: 1,
                value: controls['tree']['minSamplesSplit'] || 2,
                onChange: (value) => setParam('tree', 'minSamplesSplit', value),
                tooltip: 'Minimum number of samples required to split an internal node (2 by default)',
            }
        ],
        forest: [
            {
                id: 'criterion',
                label: 'Criterion',
                type: 'select',
                options: [
                    {value: 'gini', label: 'Gini Impurity'},
                    {value: 'entropy', label: 'Entropy'},
                ],
                value: controls['forest']['criterion'],
                onChange: (value) => setParam('forest', 'criterion', value),
                tooltip: 'Criterion to measure the quality of a split'
            },
            {
                id: 'nEstimators',
                label: 'Number of Trees',
                type: 'number',
                min: 1,
                max: 1000,
                step: 1,
                value: controls['forest']['nEstimators'] || 100,
                onChange: (value) => setParam('forest', 'nEstimators', value),
                tooltip: 'Number of trees in the forest (100 by default)',
            },
            {
                id: 'maxDepth',
                label: 'Max Depth',
                type: 'number',
                min: 1,
                max: 100,
                step: 1,
                value: controls['forest']['maxDepth'] || 10,
                onChange: (value) => setParam('forest', 'maxDepth', value),
                tooltip: 'Maximum depth of the trees (10 by default)',
            },
            {
                id: 'minSamplesSplit',
                label: 'Min Samples Split',
                type: 'number',
                min: 2,
                max: 100,
                step: 1,
                value: controls['forest']['minSamplesSplit'] || 2,
                onChange: (value) => setParam('forest', 'minSamplesSplit', value),
                tooltip: 'Minimum number of samples required to split an internal node (2 by default)',
            }
        ],
        knn: [
            {
                id: 'nNeighbors',
                label: 'Number of Neighbors',
                type: 'number',
                min: 1,
                max: 100,
                step: 1,
                value: controls['knn']['nNeighbors'] || 5,
                onChange: (value) => setParam('knn', 'nNeighbors', value),
                tooltip: 'Number of neighbors to use for KNN (5 by default)',
            },
            {
                id: 'metric',
                label: 'Distance Metric',
                type: 'select',
                options: [
                    {value: 'euclidean', label: 'Euclidean'},
                    {value: 'manhattan', label: 'Manhattan'},
                    {value: 'minkowski', label: 'Minkowski'},
                ],
                value: controls['knn']['metric'],
                onChange: (value) => setParam('knn', 'metric', value),
                tooltip: 'Distance metric to use for KNN'
            }
        ],
        gb: [
            {
                id: 'nEstimators',
                label: 'Number of Trees',
                type: 'number',
                min: 1,
                max: 1000,
                step: 1,
                value: controls['gb']['nEstimators'] || 100,
                onChange: (value) => setParam('gb', 'nEstimators', value),
                tooltip: 'Number of boosting stages to be run (100 by default)',   
            },
            {
                id: 'loss',
                label: 'Loss',
                type: 'select',
                options: [
                    {value: 'squared_error', label: 'Squared Error'},
                    {value: 'absolute_error', label: 'Absolute Error'},
                    {value: 'huber', label: 'Huber'},
                    {value: 'quantile', label: 'Quantile'},
                ],
                onChange: (value) => setParam('gb', 'loss', value),
                value: controls['gb']['loss'],
                tooltip: 'Loss function to optimize'
            },
            {
                id: 'maxDepth',
                label: 'Max Depth',
                type: 'number',
                min: 1,
                max: 100,
                step: 1,
                value: controls['gb']['maxDepth'] || 3,
                onChange: (value) => setParam('gb', 'maxDepth', value),
                tooltip: 'Maximum depth of the individual regression estimators (3 by default)',
            },
            {
                id: 'learningRate',
                label: 'Learning Rate',
                type: 'slider',
                min: 0.01,
                max: 1,
                step: 0.01,
                value: controls['gb']['learningRate'] || 0.1,
                onChange: (value) => setParam('gb', 'learningRate', value),
                tooltip: 'Learning rate shrinks the contribution of each tree (0.1 by default)',
            }
        ],
        nn: [
            {
                id: 'hiddenLayers',
                label: 'Hidden Layers',
                type: "list",
                value: controls['nn'] ? controls['nn']['hiddenLayers'] || [] : [],
                onChange: (value) => setParam('nn', 'hiddenLayers', value),
                tooltip: 'List of hidden layers with their sizes (e.g., [64, 32] for two hidden layers with 64 and 32 neurons)',
            },
            {
                id: 'activation',
                label: 'Activation Function',
                type: 'select',
                options: [
                    {value: 'relu', label: 'ReLU'},
                    {value: 'identity', label: 'Identity'},
                    {value: 'logistic', label: 'Logistic'},
                    {value: 'tanh', label: 'Tanh'},
                    {value: 'leakyrelu', label: 'Leaky ReLU (ReLU)'},
                ],
                value: controls['nn']['activation'],
                onChange: (value) => setParam('nn', 'activation', value),
                tooltip: 'Activation function to use in the hidden layers'
            },
            {
                id: 'optimizer',
                label: 'Optimizer',
                type: 'select',
                options: [
                    {value: 'adam', label: 'Adam'},
                    {value: 'sgd', label: 'Stochastic Gradient Descent'},
                ],
                value: controls['nn']['optimizer'],
                onChange: (value) => setParam('nn', 'optimizer', value),
                tooltip: 'Optimizer to use for training the neural network'
            },
            {
                id: 'learningRate',
                label: 'Learning Rate',
                type: 'slider',
                min: 0.0001,
                max: 0.1,
                step: 0.0001,
                value: controls['nn']['learningRate'] || 0.001,
                onChange: (value) => setParam('nn', 'learningRate', value),
                tooltip: 'Learning rate for the optimizer (0.001 by default)',
            },
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['nn']['epochs'] || 1000,
                onChange: (value) => setParam('nn', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            },
            {
                id: 'batchSize',
                label: 'Batch Size',
                type: 'number',
                min: 1,
                max: 1000,
                step: 1,
                value: controls['nn']['batchSize'] || 32,
                onChange: (value) => setParam('nn', 'batchSize', value),
                tooltip: 'Batch size for training the neural network (32 by default)',
            }
        ]
    }

    console.log('Model Parameters:', modelParameters[model_type]);
    return (
        <div className='flex-1 flex flex-row h-full w-full p-4 gap-8 mx-auto'>
           <div className="border-r pr-8 w-1/3 h-full flex flex-col">
                <Typography.Title level={3} className='text-gray-800'>Model Parameters</Typography.Title>
                <div className='flex-1 overflow-y-auto'>
                <Settings controls={modelParameters[model_type]} className='gap-1'/>
                </div>
                
            </div>
            <div className='flex flex-col w-2/3 gap-2'>
                <Typography.Title level={3} className='text-gray-800'>Training History</Typography.Title>
            </div>
        </div>
    );

}

export interface TrainInterfaceProps {
    onClickTrain: (epochs: number) => void;
    state: 'training' | 'ready' | 'trained';
    trainingData?: ModelTrainingInfo | null;
    modelType: string;
}

export const TrainInterface: React.FC<TrainInterfaceProps> = ({onClickTrain, state, trainingData, modelType}) => {
    //const [progress, setProgress] = useState(0);
    const progress = useFakeProgress(state);
    const [epochs, setEpochs] = useState<number>(100);
    const showEpochs = state === 'ready' && (modelType === 'linear_simple' || modelType === 'linear_fs' || modelType === 'logistic_simple' || modelType === 'logistic_fs' || modelType === 'svm' || modelType === 'gb' || modelType === 'nn');

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-10 gap-8">
            {state === 'training' && (
                <CircularProgressBar
                progress={progress}
                size={250}
                thickness={8}
                className="text-blue-500"
                showPercentage={true}
                animate={true}
                duration={500}
                />
            )}
            {state === 'ready' && (
                <div className='flex flex-col gap-2'>
                <SquareButton
                title="Train"
                icon={<BrainCog />}
                size={250}
                onClick={() => onClickTrain(epochs)}
                />
                </div>
            )}
            {state === 'trained' && (
                <div className='flex flex-col items-center gap-4'>
                <Typography.Title level={3} className="text-green-500">
                Model Trained Successfully!
                </Typography.Title>
                {trainingData && <Typography.Text>{`Model trained in ${trainingData.trainingTime}ms`}</Typography.Text>}
                </div>
            )}
            {showEpochs && <div className='flex flex-col items-center w-1/2'>
                <Typography.Title level={5}>Epochs</Typography.Title>
            <RangeSlider min={1} max={1000} step={1} value={epochs} onChange={(value) => setEpochs(value[0])} className="w-full" />
            </div>}
            </div>
    );
}


export const EvaluationInterface: React.FC<{trainingData:ModelTrainingInfo | null}> = ({trainingData}) => {
    const numCols = trainingData?.rocAuc ? 3 : 2;
    return trainingData ? (
        trainingData.problemType === 'classify' ? (
        <div className='flex-1 flex-col gap-4 overflow-y-auto'>
            <div className={`grid grid-cols-${numCols} gap-4 p-8`}>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title={`Accuracy (base: ${trainingData.baseAccuracy*100}%)`} value={trainingData.accuracy*100} />
                </Card>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title="Precision" value={trainingData.precision*100} />
                </Card>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title="Recall" value={trainingData.recall*100} />
                </Card>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title="F1 Score" value={trainingData.f1Score*100} />
                </Card>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title="ROC AUC" value={trainingData.rocAuc*100} />
                </Card>
                <Card variant="borderless" size='default'>
                <Statistic precision={3} suffix={'%'} title="Average Precision" value={trainingData.averagePrecision*100} />  
                </Card>  
            </div>
            <div className='flex flex-row gap-4 p-4'>
                <LineAreaChart data={[
                    {
                        x: trainingData.rocX,
                        y: trainingData.rocY,
                        name: 'ROC Curve',
                        color: 'blue',
                    }
                ]} isAreaChart={false} interpolation='linear' title='ROC Curve' xAxisLabel='False Positive Rate' yAxisLabel='True Positive Rate'/>
                <LineAreaChart data={[
                    {
                        x: trainingData.prX,
                        y: trainingData.prY,
                        name: 'Precision-Recall Curve',
                        color: 'red',
                    }
                ]} isAreaChart={false} interpolation='linear' title='Precision-Recall Curve' xAxisLabel='Recall' yAxisLabel='Precision'/>
            </div>
            <div className='flex-1 flex flex-row gap-4 p-4'>
                <div className='flex flex-1 flex-col gap-4 w-1/2'>
                <LineAreaChart data={[
                    {
                        x: trainingData.learningCurve.trainSizes,
                        y: trainingData.learningCurve.trainScoresMean,
                        name: 'Train Scores',
                        color: 'green',
                    },
                    {
                        x: trainingData.learningCurve.trainSizes,
                        y: trainingData.learningCurve.testScoresMean,
                        name: 'Test Scores',
                        color: 'orange',
                    }
                ]} isAreaChart={false} interpolation='linear' title='Learning Curve' xAxisLabel='Sample Size' yAxisLabel='Accuracy'/>
                </div>
                <div className='flex-1 flex flex-col gap-4 p-4'>
                <Typography.Title level={4} className='text-gray-800'>Decision Boundary (Projected)</Typography.Title>
                <MulticlassScatterPlot
                    X={trainingData.decisionBoundary}
                    Y={trainingData.predictedClasses}
                    xLabel='Principal Component 1'
                    yLabel='Principal Component 2'
                    title='Decision Boundary'
                />
            </div>
            </div>
           {/*  {trainingData.decisionBoundary && } */}
        </div>
        ) : (
        <div className='flex-1 flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-4 p-4'>
                <Statistic title="R2 Score" value={trainingData.r2} />
                <Statistic title="MSE" value={trainingData.mse} />
                <Statistic title="RMSE" value={trainingData.rmse} />
                <Statistic title="MAE" value={trainingData.mae} />
            </div>
            <div className='flex flex-col gap-4 p-4'>
                <LineAreaChart data={[
                    {
                        x: trainingData.yTest,
                        y: trainingData.yPred,
                        name: 'Predicted vs Actual',
                        color: 'blue',
                    }
                ]} isAreaChart={false} interpolation='linear' />
                <LineAreaChart data={[
                    {
                        x: trainingData.yTest,
                        y: trainingData.residuals,
                        name: 'Predicted vs Residuals',
                        color: 'red',
                    }
                ]} isAreaChart={false} interpolation='linear' />
            </div>
        </div>
        )
    ) : (
        <div className='flex-1 flex items-center justify-center'>
            <Typography.Title level={3} className="text-gray-500">No training data available</Typography.Title>
        </div>
    );
}


export const InferenceInterface: React.FC<{datasetData: DatasetMetadata | null, workflow: Workflow | null, modelType: string}> = ({datasetData, workflow, modelType}) => {
    
    const [inputData, setInputData] = useState<Record<string, any>>({});
    const numericCols = datasetData?.columns.filter(col => datasetData?.columnTypes[col] === 'num') || [];
    const categoricalCols = datasetData?.columns.filter(col => datasetData?.columnTypes[col] === 'cat') || [];
    const [prediction, setPrediction] = useState<any>(null);

    useEffect(() => {
        const result = {};
        for (const col in datasetData?.columns){
            if (datasetData?.columnTypes[col] === 'num' && !inputData[col]) {
                result[col] = datasetData?.numericalInfo[col]?.min || 0;
            }
            else if (datasetData?.columnTypes[col] === 'cat' && !inputData[col]) {
                result[col] = datasetData?.categoricalInfo[col]?.values[0] || '';
            }
        }
        console.log('Initial Input Data:', result);
/* 
        const numInits = numericCols.map(col => ({
            [col]: datasetData?.numericalInfo[col]?.min || 0
        }));
        const catInits = categoricalCols.map(col => ({
            [col]: datasetData?.categoricalInfo[col]?.values[0] || ''
        })); */
        setInputData(result);
    }, []);
    
    const catControls: SettingControl[] | undefined = categoricalCols.map((str) => ({
        id: str,
        label: str.charAt(0).toUpperCase() + str.slice(1), // Capitalize first letter
        type: 'select',
        value: inputData[str],
        options: datasetData?.categoricalInfo[str]?.values.map(cat => ({ value: cat, label: cat })) || [],
        onChange: (value: string | number) => {
            setInputData(prev => ({
                ...prev,
                [str]: value
            }));
        },
        tooltip: `Select value for ${str}`,
      }));

    const numControls: SettingControl[] | undefined = numericCols.map((str) => ({
    id: str,
    label: str.charAt(0).toUpperCase() + str.slice(1), // Capitalize first letter
    type: 'slider',
    min: datasetData?.numericalInfo[str]?.min || 0,
    max: datasetData?.numericalInfo[str]?.max || 100,
    value: inputData[str],
    step: (datasetData?.numericalInfo[str]?.max! - datasetData?.numericalInfo[str]?.min!) / 100 || 1,
    onChange: (value: number) => {
        setInputData(prev => ({
            ...prev,
            [str]: value
        }));
    },
    tooltip: `Enter value for ${str}`,
    }));

    const settingControls = [...catControls, ...numControls];

    const onMakeInference = () => {
        console.log('Making inference with input data:', inputData);
        const request = async () => {
            try {
                const body = {
                    xPred: inputData,
                    modelType: modelType,
                    wfDir: workflow?.wfDir,
                }
                return await makeInference(body);
            }
            catch (error) {
            }
            
        }
        request().then((response) => {
            setPrediction(response);
            message.success('Inference made successfully!');
        }).catch((error) => {
            message.error('Failed to make inference. Please check your inputs and try again.');
            setPrediction(null);
        });
    }

    return (
        <div className='flex-1 flex flex-row gap-4 p-0'>
            <div className='w-1/2 border-r overflow-y-hidden p-2 pb-8'>
            <Typography.Title level={3}>Enter Inputs</Typography.Title>
            {datasetData && workflow && settingControls ? <Settings controls={settingControls} className='gap-2' /> : <Typography.Title>Failed to Load App State</Typography.Title>}
            </div>
            <div className='flex-1 flex flex-col justify-center items-center gap-8'>
                <Typography.Title>{prediction}</Typography.Title>
                <Button type='primary' size='large' onClick={onMakeInference}>Infer</Button>
            </div>
        </div>
    );
}

