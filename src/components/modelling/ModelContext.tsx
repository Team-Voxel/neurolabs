import Toolbar from "../Toolbar";
import { useCallback, useContext, useEffect, useState } from "react";
import { useWorkflowStore, Workflow } from "../../AppState";
import { ModelMetadataObject } from "../../backend_api/types";
import { Modal, Button, Typography } from "antd";
import { AddNewModel } from "./Modals";
import { NNModel } from "./NNModel";
import { LinearRegression } from "./LinearRegression";
import { ModelCard } from "./ModelCard";
import { PiPlus } from "react-icons/pi";


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
    const [openDialogIdx, setOpenDialogIdx] = useState<number>(-1);
    const [modelMetadataObject, setModelMetadataObject] = useState<ModelMetadataObject | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    const workflow = useWorkflowStore((state) => state.current);
    
    useEffect(() => {
        if (workflow) {
            window.wfStore.getModelMetadata(workflow.name).then((metadata) => {
                setModelMetadataObject(metadata);
            }).catch((err) => {
                console.error('Error fetching model metadata:', err);
                setModelMetadataObject(null);
            });
        }
    }, [workflow]);

    const handleCancel = () => {
        setOpenDialogIdx(-1);
    };

    return (
        <>
        <div className='flex flex-col w-full h-full'>
            <Toolbar 
                onNew={() => setOpenDialogIdx(1)}
                onOpen={() => setOpenDialogIdx(2)}
                onSettings={() => console.log('Settings clicked')}
                onHelp={() => console.log('Help clicked')}
                onInfo={() => console.log('Info clicked')}
                onTrain={() => console.log('Train clicked')}
                onInspect={() => console.log('Inspect clicked')}
                onEvaluate={() => console.log('Evaluate clicked')}
            />
            {workflow && workflow.userModels.length > 0 ? 
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
                {modelMetadataObject && Object.keys(modelMetadataObject).length > 0 && 
                    (                        
                        Object.entries(modelMetadataObject).map(([modelName, metadata]) => {
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
                    )    
                }
                </div>
                <div className="flex-1 w-1/2 overflow-y-auto">
                    {(selectedModel && modelMetadataObject && modelMetadataObject[selectedModel]) ? 
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
        <AddNewModel 
            open={openDialogIdx === 1}
            onConfirm={(modelType: ModelType, modelName: string) => {
                console.log('New model confirmed:', modelType, modelName);
                setOpenDialogIdx(-1);
            }}
            onCancel={handleCancel}
            type='class'
        />
        </>
    );

};