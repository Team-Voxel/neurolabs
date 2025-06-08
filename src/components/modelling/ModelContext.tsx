import Toolbar from "../Toolbar";
import { useCallback, useContext, useEffect, useState } from "react";
import { ModelType, UserModel, useWorkflowStore, Workflow } from "../../AppState";
import { Modal, Button, Typography } from "antd";
import { AddNewModel, OpenModelModal } from "./Modals";
import { NNModel } from "./NNModel";
import { LinearRegression } from "./LinearRegression";
import { ModelCard } from "./ModelCard";
import { PiPlus } from "react-icons/pi";

const modelTypes = {
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
}

export const ModelContext : React.FC = () => {
    const [model, setModel] = useState<UserModel | null>(null);
    const [openDialogIdx, setOpenDialogIdx] = useState<number>(-1);
    const [selectedModel, setSelectedModel] = useState<UserModel | null>(null);

    const workflow = useWorkflowStore((state) => state.current);
    
    useCallback(() => {
        if (workflow) {
            const currentModel = workflow.currentModel;
            if (currentModel) {
                setModel(currentModel);
            }
        }
    }
    , [workflow]);

    const handleCancel = () => {
        setOpenDialogIdx(-1);
    };

    const addNewModel = (modelType: ModelType, name : string) => {
        console.log('Adding new model of type:', modelType, 'with name:', name);
        setOpenDialogIdx(-1);
    }

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
            {workflow && workflow.userModels.length ? 
            (
                <div className="flex-1 w-full overflow-y-auto">
                    {workflow.userModels.map((model) => (
                        <ModelCard key={model.type} modelName={model.name} modelType={modelTypes[model.type]} isSelected={model.name === selectedModel?.name} onSelect={() => setSelectedModel(model)} />
                    ))}
                </div>
            ) : 
            (
                <div className="flex-1 w-full overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex flex-col border-2 rounded-md p-4 gap-2 shadow-md h-50 w-50 items-center justify-center  border-gray-300 hover:border-blue-500 hover:cursor-pointer" onClick={() => setOpenDialogIdx(1)}>
                            <PiPlus className="w-20 h-20" />
                            <Typography.Title level={3}>Add a new model</Typography.Title>
                        </div>
                        <ModelCard key='nn' modelName='My model' modelType='logistic' isSelected={false} onSelect={() => setSelectedModel(null)} />
                    </div>
                </div>
            )
            }
        </div>
        <AddNewModel 
            open={openDialogIdx === 1}
            onConfirm={addNewModel}
            onCancel={handleCancel}
            type='class'
        />
        <OpenModelModal 
            open={openDialogIdx === 2}
            onConfirm={() => console.log('Open model confirmed')}
            onCancel={handleCancel}
            models={workflow?.userModels || []}
        />
        </>
    );

};