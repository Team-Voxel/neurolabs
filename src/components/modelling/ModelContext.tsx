import Toolbar from "../Toolbar";
import { useCallback, useContext, useEffect, useState } from "react";
import { Workflow } from "../../AppState";
import { ModelMetadata } from "../../backend_api/types";
import { Modal, Button, Typography, message } from "antd";
import { AddNewModel } from "./Modals";
import { NNModel } from "./NNModel";
import { LinearRegression } from "./LinearRegression";
import { useNavigate } from "react-router-dom";
import { ModelCard, ActionCard, ActionCardProps} from "./ModelCard";
import { PiPlus } from "react-icons/pi";
import { Brain } from "lucide-react";
import { Fa1, Fa2, Fa3, Fa4, Fa5, Fa6, Fa7, Fa8 } from "react-icons/fa6";

export enum ModelType {
    LINEAR_REG = 0,
    SV_REG,
    KNN_REG,
    DT_REG,
    RF_REG,
    GB_REG,
    NN_REG,
    LOGS_CLASS,
    SV_CLASS,
    KNN_CLASS,
    DT_CLASS,
    RF_CLASS,
    GB_CLASS,
    NN_CLASS,
}  


export const ModelContext : React.FC = () => {
    const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | undefined>(undefined);
    const [openDialogIdx, setOpenDialogIdx] = useState<number>(-1);
    const [modelMetadataObjects, setModelMetadataObjects] = useState<Record<string, ModelMetadata> | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const navigate = useNavigate();
    
    useEffect(() => {
        window.stateAPI.getModelMetadata().then((metas) => {
            setModelMetadataObjects(metas);
        }).catch(error => {
            message.error("Couldn't fetch model metadata.");
        })

        window.stateAPI.getAppState().then(({ workflows, current }) => {
            setCurrentWorkflow(current);
        }).catch(error => {
            message.error("Couldn't fetch app state: " + error.message);
        });
    }, []);

    const handleCancel = () => {
        setOpenDialogIdx(-1);
    };
    const keys : string[] = modelMetadataObjects ? Object.keys(modelMetadataObjects) : [];
    const classificationModels : ActionCardProps[] = [
        {
            title: 'Logistic Regression',
            description: 'Train a linear logistic regression classifier to make linear decision boundaries',
            icon: <Fa1/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'logistic') : false,
            onTrain: () => navigate('/model-interface/?model=logistic,startTab=preprocessing'),
            onMetrics: () => navigate('/model-interface/?model=logistic,startTab=metrics'),
            onInfer: () => () => navigate('/model-interface/?model=logistic,startTab=infer'),
        },
        {
            title: 'Support Vector Classifier',
            description: '',
            icon: <Fa2/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=svm,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=svm,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=svm,startTab=infer'),
        },
        {
            title: 'Decision Tree Classifier',
            description: '',
            icon: <Fa3/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=tree,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=tree,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=tree,startTab=infer'),
        },
        {
            title: 'Random Forest Classifier',
            description: '',
            icon: <Fa4/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=forest,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=forest,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=forest,startTab=infer'),
        },
        {
            title: 'Gradient Boost Classifier',
            description: '',
            icon: <Fa5/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=gb,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=gb,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=gb,startTab=infer'),
        },
        {
            title: 'K-Nearest Neighbors Classifier',
            description: '',
            icon: <Fa6/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=knn,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=knn,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=knn,startTab=infer'),
        },
        {
            title: 'Naive Bayes Classifier',
            description: '',
            icon: <Fa7/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'svm') : false,
            onTrain: () => navigate('/model-training/?model=nb,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=nb,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=nb,startTab=infer'),
        },
        {
            title: 'Neural Network',
            description: 'Train a neural network model for regression or classification tasks.',
            icon: <Fa8/>,
            isTrained: modelMetadataObjects ? keys.some(key => modelMetadataObjects[key].type === 'nn') : false,
            onTrain: () => navigate('/model-training/?model=nn,startTab=preprocessing'),
            onMetrics: () => navigate('/model-training/?model=nn,startTab=metrics'),
            onInfer: () => () => navigate('/model-training/?model=nn,startTab=infer'),
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 h-full">
                
                {classificationModels.map((model, index) => (
                    <ActionCard
                        key={index}
                        icon={model.icon}
                        title={model.title}
                        description={model.description}
                        isTrained={model.isTrained}
                        onTrain={model.onTrain}
                        onMetrics={model.onMetrics}
                        onInfer={model.onInfer}
                    />
                ))}
            </div>
        </>
    );
    
};


/*


return (
        <>
        <div className='flex flex-col w-full h-full'>
            {modelMetadataObjects && Object.keys(modelMetadataObjects).length > 0 ? 
            (
                <div className="flex flex-row h-full w-full">
                <div className="flex flex-col w-1/2 overflow-y-auto">
                    <div 
                        className={`relative flex flex-row gap-4 p-6 rounded-xl cursor-pointer
                            min-h-32 min-w-48 transition-all duration-300 ease-in-out transform                  
                            hover:shadow-2xl justify-center items-center border-2 border-gray-400
                            group
                            `}
                        onClick={() => setOpenDialogIdx(1)}>
                            <PiPlus className="w-10 h-10" />
                            <Typography.Title level={3}>New Model</Typography.Title>
                            <div className={`
                            absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                            ${'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'}
                            pointer-events-none
                            `}></div>
                    </div>
                
                                            
                        {Object.entries(modelMetadataObjects).map(([modelName, metadata]) => {
                            return (
                            <ModelCard 
                                key={modelName} 
                                modelName={modelName} 
                                modelType={metadata.type} 
                                isSelected={selectedModel === modelName} 
                                onSelect={(name: string) => setSelectedModel(name)} 
                                onRetrain={() => console.log(`Retrain model : ${modelName}`)} 
                                onDelete={() => console.log(`Delete model : ${modelName}`)} 
                            />
                        );
                        })
                }
                </div>
                <div className="flex-1 w-1/2 overflow-y-auto">
                    {(selectedModel && modelMetadataObjects && modelMetadataObjects[selectedModel]) ? 
                        (
                            // Render model metrics/parameters based on type
                            <></>
                        )
                    : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Typography.Title level={3}>Select a model to view details</Typography.Title>
                    </div>)
                    }
                </div>
                </div>
            ) : 
            (
                <div className="flex-1 w-full h-full overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full gap-4 py-4">
                        <div 
                        className={`relative flex flex-col gap-4 p-6 rounded-xl cursor-pointer w-50 h-50
                            min-h-32 min-w-48 transition-all duration-300 ease-in-out transform                  
                            hover:shadow-2xl justify-center items-center border-2 border-gray-400
                            group
                            `}
                        onClick={() => setOpenDialogIdx(1)}>
                            <PiPlus className="w-20 h-20" />
                            <Typography.Title level={3}>New Model</Typography.Title>
                            <div className={`
                            absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                            ${'bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100'}
                            pointer-events-none
                            `}></div>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
        {currentWorkflow && <AddNewModel 
            currentWF={currentWorkflow}
            open={openDialogIdx === 1}
            onConfirm={(modelType: ModelType, modelName: string) => {
                console.log('New model confirmed:', modelType, modelName);
                setOpenDialogIdx(-1);
            }}
            onCancel={handleCancel}
            type='class'
        />}
        </>
    );


*/