import React, { useReducer, useState } from 'react';
import { Typography, Card, Tooltip, Flex } from 'antd';
import { SettingControl } from '../settings/types';
import Settings from '../settings/Settings';

const modelParameterInitialState: Record<string, Record<string, any>> = {
    linear_simple: {
        loss: 'squared_loss',
        optimizer: 'analytical',
        epochs: 1000
    },
    linear_fs: {
        loss: 'squared_loss',
        optimizer: 'analytical',
        regularization: 'none',
    },
    logistic_simple: {
        epochs: 1000
    },
    logistic_fs: {
        epochs: 1000,
        regularization: 'none',
        alpha: 1
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

export const ParameterInterface : React.FC<{ model_type: string }> = ({model_type}) => {
    
    const [controls, setControls] = useState<Record<string, Record<string, any>>>(modelParameterInitialState);
    const setParam = (model: string, param: string, value: any) => {
        setControls(prev => ({
            ...prev,
            [model]: {
              ...prev[model],
              [param]: value,
            },
        }));
    }
    const getParam = (model: string, param: string) => {
        return controls[model] ? controls[model][param] : undefined;
    }

    const modelParameters : Record<string, SettingControl[]> = {
        linear_simple: [
            {
                id: 'loss',
                label: 'Loss',
                type: 'select',
                options: [
                    {value: 'squared_loss', label: 'Squared Error'},
                    {value: 'huger', label: 'Huber'},
                ],
                onChange: (value) => setParam('linear_simple', 'loss', value),
                value: controls['linear_simple']['loss'],
                tooltip: 'Loss function'
            },
            {
                id: 'optimizer',
                label: 'Optimizer',
                type: 'select',
                options: [
                    {value: 'analytical', label: 'Analytical'},
                    {value: 'sgd', label: 'Stochastic Gradient Descent'},
                ],
                value: controls['linear_simple']['optimizer'],
                onChange: (value) => setParam('linear_simple', 'optimizer', value),
                tooltip: 'Optimization algorithm to use'
            },
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['linear_simple']['epochs'] || 1000,
                onChange: (value) => setParam('linear_simple', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            }
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
                id: 'optimizer',
                label: 'Optimizer',
                type: 'select',
                options: [
                    {value: 'analytical', label: 'Analytical'},
                    {value: 'sgd', label: 'Stochastic Gradient Descent'},
                ],
                value: controls['linear_fs']['optimizer'],
                onChange: (value) => setParam('linear_fs', 'optimizer', value),
                tooltip: 'Optimization algorithm to use'
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
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['linear_fs']['epochs'] || 1000,
                onChange: (value) => setParam('linear_fs', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            }
        ],
        logistic_simple: [
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['logistic_simple']['epochs'] || 1000,
                onChange: (value) => setParam('logistic_simple', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            }
        ],
        logistic_fs: [
            {
                id: 'epochs',
                label: 'Epochs',
                type: 'number',
                min: 1,
                max: 10000,
                step: 100,
                value: controls['logistic_fs']['epochs'] || 1000,
                onChange: (value) => setParam('logistic_fs', 'epochs', value),
                tooltip: 'Number of training epochs (1000 by default)',
            },
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
                value: controls['logistic_fs']['c'] || 1,
                onChange: (value) => setParam('logistic_fs', 'alpha', value),
                tooltip: 'Regularization strength (0.01 by default)',
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





/*   type Action =
  | { type: 'SET_PARAM'; model: string; param: string; value: any }
  | { type: 'RESET_MODEL'; model: string }
  | { type: 'GET_MODEL'; model: string}
  | { type: 'GET_PARAM'; model: string; param: string};

    function controlsReducer(
    state: Record<string, Record<string, any>>,
    action: Action
    ): typeof state {
    switch (action.type) {
        case 'SET_PARAM':
        return {
            ...state,
            [action.model]: {
            ...state[action.model],
            [action.param]: action.value,
            },
        };
        case 'RESET_MODEL':
        return {
            ...state,
            [action.model]: {},
        };
        case 'GET_MODEL':
        return state[action.model];
        case 'GET_PARAM':
        return state[action.model][action.param];
        default:
        return state;
    }
    }

    
    const [controls, dispatch] = useReducer(controlsReducer, {}); */