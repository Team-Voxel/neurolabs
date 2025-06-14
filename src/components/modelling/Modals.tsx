import { Modal, Button, Input, Tooltip, Typography, Segmented, message } from "antd";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import papa from "papaparse";
import { ModelType } from "./ModelContext";
import VerticalSelector, {SelectionOption} from "../VerticalList";
import Settings from "../settings/Settings";
import { Workflow } from "../../AppState";

import LogisticVideo from "../../assets/videos/logistic.mp4";
import SVMVideo from "../../assets/videos/svm.mp4";
import { SettingControl } from "../settings/types";
import { error } from "console";


/* const modelTypes = {
    [ModelType.LINEAR_REG]: 'linear',
    [ModelType.SV_REG]: 'svm',
    [ModelType.KNN_REG]: 'knn',
    [ModelType.DT_REG]: 'tree',
    [ModelType.RF_REG]: 'forest',
    [ModelType.GB_REG]: 'gb',
    [ModelType.NN_REG]: 'nn',
    [ModelType.LOGS_CLASS]: 'logistic',
    [ModelType.SV_CLASS]: 'svm',
    [ModelType.KNN_CLASS]: 'knn',
    [ModelType.DT_CLASS]: 'tree',
    [ModelType.RF_CLASS]: 'forest',
    [ModelType.GB_CLASS]: 'gb',
    [ModelType.NN_CLASS]: 'nn',
}   */ 

export interface ModelInfo {
    name: string;
    type: ModelType;
    description: string;
    imageUrl: string;
    value: string;
}


const classificationOptions : SelectionOption[] = [
    {
        id: 'logistic',
        label: 'Logistic Regression',
        value: 'logistic',
    },
    {
        id: 'svm',
        label: 'Support Vector Machine',
        value: 'svm',
    },
    {
        id: 'tree',
        label: 'Decision Tree',
        value: 'tree',
    },
    {
        id: 'forest',
        label: 'Random Forest',
        value: 'forest',
    },
    {
        id: 'gb',
        label: 'Gradient Boosting',
        value: 'gb',
    },
    {
        id: 'knn',
        label: 'K-Nearest Neighbors',
        value: 'knn',
    },
    {
        id: 'nn',
        label: 'Neural Network',
        value: 'nn',
    },
];

const regressionOptions : SelectionOption[] = [
    {
        id: 'linear',
        label: 'Linear Regression',
        value: 'linear',
    },
    {
        id: 'svm',
        label: 'Support Vector Machine',
        value: 'svm',
    },
    {
        id: 'logistic',
        label: 'Decision Tree',
        value: 'tree',
    },
    {
        id: 'tree',
        label: 'Random Forest',
        value: 'forest',
    },
    {
        id: 'gb',
        label: 'Gradient Boosting',
        value: 'gb',
    },
    {
        id: 'knn',
        label: 'K-Nearest Neighbors',
        value: 'knn',
    },
    {
        id: 'nn',
        label: 'Neural Network',
        value: 'nn',
    },
];


const skactivations = [
    { label: 'Identity', value: 'identity' },
    { label: 'ReLU', value: 'relu' },
    { label: 'Sigmoid', value: 'sigmoid' },
    { label: 'Tanh', value: 'tanh' },
];

const torchactivations = [
    { label: 'Identity', value: 'identity' },
    { label: 'ReLU', value: 'relu' },
    { label: 'Leaky ReLU', value: 'leakyrelu' },
    { label: 'ELU', value: 'elu' },
    { label: 'GELU', value: 'gelu' },
];
/* 
const RegressionModels : ModelInfo[] = [
{
    name: "Linear Regression",
    type: ModelType.LINEAR_REG,
    description: "A linear approach to modeling the relationship between a scalar response and one or more explanatory variables.",
    imageUrl: "",
    value: "linr"
},
{
    name: "Support Vector Regression",
    type: ModelType.SV_REG,
    description: "A support vector machine approach to regression, \
    which aims to find a function that deviates from the actual observed \
    values by a value no greater than a specified margin.",
    imageUrl: "",
    value: "svr"
},
{
    name: "Nearest Neighbors Regression",
    type: ModelType.NN_REG,
    description: "A regression method that predicts the value of a target variable \
    based on the values of its nearest neighbors in the feature space.",
    imageUrl: "",
    value: "nnr"
},
{
    name: "Decision Tree Regression",
    type: ModelType.DT_REG,
    description: "A decision tree-based approach to regression, which splits the data into subsets based on feature values.",
    imageUrl: "",
    value: "dtr"
},
{
    name: "Random Forest Regression",
    type: ModelType.RF_REG,
    description: "An ensemble method that uses multiple decision trees to improve the accuracy of regression predictions.",
    imageUrl: "",
    value: "rfr"
},
{
    name: "Gradient Boosting Regression",
    type: ModelType.GB_REG,
    description: "An ensemble method that builds models sequentially, each trying to correct the errors of the previous one.",
    imageUrl: "",
    value: "gbr"
},
{
    name: "Deep Neural Network",
    type: ModelType.NN_REG,
    description: "A deep learning approach to regression, which uses multiple layers of neurons to learn complex patterns in the data.",
    imageUrl: "",
    value: "dnnr"
}
]

const ClassificationModels : ModelInfo[] = [
{
    name: "Logistic Regression",
    type: ModelType.LOGS_CLASS,
    description: "A linear approach to classification that models the probability\
     of a multiple class outcome based on one or more predictor variables.",
    imageUrl: "",
    value: "logr"
},
{
    name: "Support Vector Classification",
    type: ModelType.SV_CLASS,
    description: "A support vector machine approach to classification, which aims to find a hyperplane that separates the classes.",
    imageUrl: "",
    value: "svc"
},
{
    name: "Nearest Neighbors Classification",
    type: ModelType.NN_CLASS,
    description: "A classification method that predicts the class of a target variable based on the classes of its nearest neighbors.",
    imageUrl: "",
    value: "nnc"
},
{
    name: "Decision Tree Classification",
    type: ModelType.DT_CLASS,
    description: "A decision tree-based approach to classification, which splits the data into subsets based on feature values.",
    imageUrl: "",
    value: "dtc"
},
{
    name: "Random Forest Classification",
    type: ModelType.RF_CLASS,
    description: "An ensemble method that uses multiple decision trees to improve the accuracy of classification predictions.",
    imageUrl: "",
    value: "rfc"
},
{
    name: "Gradient Boosting Classification",
    type: ModelType.GB_CLASS,
    description: "An ensemble method that builds models sequentially, each trying to correct the errors of the previous one.",
    imageUrl: "",
    value: "gbc"
},
{
    name: "Deep Neural Network",
    type: ModelType.NN_CLASS,
    description: "A deep learning approach to classification, which uses multiple layers of neurons to learn complex patterns in the data.",
    imageUrl: "",
    value: "dnnc"
},
]
 */
interface AddNewModelProps {
    currentWF: Workflow;
    open : boolean;
    type : 'reg' | 'class';
    onCancel: () => void;
    onConfirm: (model: ModelType, name : string) => void;
}

export const AddNewModel : React.FC<AddNewModelProps> = ({currentWF, open, onCancel, onConfirm}) => {
    const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [step, setStep] = useState<number>(1);

    const [type, setType] = useState<string>('nn');

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

    const [datasetSize, setDatasetSize] = useState<number>(0);
    
    const confirmValidation = (model: ModelType, name : string) => {
        if (name.trim() === '') {
            alert('Please enter a name for the model');
            return false;
        }
        onConfirm(model, name);
    } 


    const trainingParams: SettingControl[] = [
        {
            id: 'epochs',
            label: 'Epochs',
            type: 'slider',
            value: epochs,
            min: 1,
            max: 1000,
            step: 1,
            onChange: (value) => setEpochs(value),
            visible: type === 'nn' || type === 'svm' || type === 'logistic' || type === 'linear',
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
            visible: type === 'logistic' || type === 'linear',
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
            options: datasetSize > 5000 ? torchactivations : skactivations,
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

    const handleModelTraining = () => {

    }

    const footer1 = [
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
        <Button key="next" type="primary" onClick={() => setStep(2)} disabled={!isVideoReady || name.trim() === ''}>
          Next
        </Button>
    ]

    const footer2 = [
        <Button key="back" onClick={() => setStep(1)}>
          Back
        </Button>,
        <Button key="confirm" type="primary" onClick={() => {}}>
          Train Model
        </Button>
    ]

    return (
        <Modal 
            title="Add New Model"
            open={open} 
            onCancel={onCancel} 
            onClose={onCancel}
            closeIcon={false}
            width={800}
            footer={step === 1 ? footer1 : footer2}
        >
            {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Input placeholder= "Enter a name" value={name} onChange={(e) => setName(e.target.value)} size="large"/>
                <div className="flex flex-row items-start justify-center w-full gap-4">
                <div className="flex flex-col h-full w-1/3">
                    <VerticalSelector  options={currentWF!.problemType == 'regression' ? regressionOptions : classificationOptions} onChange={(value) => setType(value)} selectedValue={type}/>
                </div>
                <div className="flex flex-col items-center justify-center h-full w-2/3 gap-4">
                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden h-1/2">  
                        <ReactPlayer
                            url={SVMVideo}
                            playing={true}
                            loop={true}
                            width="100%"
                            height="100%"
                            onReady={() => setIsVideoReady(true)}
                            onError={(e) => {
                                console.error('Video playback error:', e);
                                message.error('Failed to load video');
                            }}
                            config={{
                                file: {
                                    attributes: {
                                        controlsList: 'nodownload',
                                        disablePictureInPicture: true,
                                        controls: false,
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="w-full h-1/2">
                        {/* Show a description of the selected model */}
                        <Typography.Text>
                            {'Support Vector Machine (SVM) is a powerful classifier that finds the optimal hyperplane to separate classes.'}
                        </Typography.Text>
                    </div>
                </div>
            </div>
            </div>
            )}
            {step === 2 && (
                <div className='flex-1 flex-col gap-4 items-center mt-4 justify-between pr-4'>
                    <Typography.Title level={4}>Training Parameters</Typography.Title>
                    <Settings controls={trainingParams} />
                </div>
            )}
            {/* This window is shown until the model is trained. Cannot close. */}
            {step === 3 && (
                <div>
                    <Typography.Title level={3}>Training Model...</Typography.Title>
                    <Typography.Text>Please wait while the model is being trained.</Typography.Text>
                </div>   
            )}
        </Modal>
    )
}