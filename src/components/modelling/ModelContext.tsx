import Toolbar from "../Toolbar";
import { useCallback, useContext, useEffect, useState } from "react";
import { ModelType, UserModel, useWorkflowStore, Workflow } from "../../AppState";
import { Modal, Button } from "antd";
import { AddNewModel, OpenModelModal } from "./Modals";
import { NNModel } from "./NNModel";


export const ModelContext : React.FC = () => {
    const [model, setModel] = useState<UserModel | null>(null);
    const [openDialogIdx, setOpenDialogIdx] = useState<number>(-1);

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
            {model ? (
                <div className="flex-1 w-full overflow-y-auto">

                </div>)
                : 
                (<div className="flex-1 w-full overflow-y-auto">
                    <div className="flex flex-col items-center justify-center h-full">
                        {/* <h1 className="text-2xl font-bold">No model loaded</h1>
                        <p className="text-gray-500">Please load a model to view its context.</p> */}
                        <NNModel></NNModel>
                    </div>
                </div>)
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