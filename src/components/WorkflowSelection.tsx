import React, {useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Button from "./CreateNewButton";
import List, {ListItem} from "./CustomList";
import Plus from "../assets/plus.png"
import File from "../assets/folders.png"
import SelectionGrid from "./selectionGrid";
import Card from "./Card";

import { useWorkflowStore, Workflow } from "../AppState";

// Show workflow selection screen
// New -> New workflow window
// Existing -> Load and proceed to MainNavigation


export const WorkflowSelection : React.FC = () => {
    const [wfs, setWfs] = useState<Workflow[]>([]);
    const navigate = useNavigate();

    const loadWorkflow = (name: string) => {
      useWorkflowStore.getState().setCurrentByName(name);
      navigate("/sandbox");
    }
    
    const deleteWorkflow = (name: string) => {
      useWorkflowStore.getState().removeNyName(name).then(() => {
        setWfs(useWorkflowStore.getState().workflows);
      });
    }

    useEffect(() => {
      setWfs(useWorkflowStore.getState().workflows);
    }, []);
      
    return (
        <div className="flex flex-col items-center w-screen h-screen text-gray-300 p-4 gap-8 bg-gradient-to-br from-gray-700 to-gray-800">
            <h1 className="mb-10">Workflow Selection</h1>

        
            <div className="h-full w-full">
           {wfs.length > 0 ? (
            <div className="flex h-full">
            {/* Left side: New Workflow */}
            <div className="w-1/2 flex justify-center items-start pt-15 border-r border-gray-300">
              <Button icon={Plus} label="New Workflow" onClick={() => navigate("/new-workflow")} />
            </div>


      {/* Right side: Recent Workflows */}
                <div className="w-1/2 overflow-y-auto p-4">
                  <div className="flex flex-wrap justify-start gap-4">
                    {wfs.map((wf, index) => (
                      <Card
                        key={index}
                        name={wf.name}
                        imageSrc="../assets/folders.svg"
                        imageAlt="WorkFlow"
                        onOpen={loadWorkflow}
                        onDelete={deleteWorkflow}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Centered New Workflow when no recent workflows
              <div className=" flex justify-center items-center h-full ">
                <Button icon={Plus} label="New Workflow" onClick={() => navigate("/new-workflow")} />
              </div>
            )}
          </div>

        </div>
    );
}
