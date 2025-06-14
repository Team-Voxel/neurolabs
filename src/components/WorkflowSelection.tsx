import React, {useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Button from "./CreateNewButton";
import Plus from "../assets/plus.png"
import {Card} from "./Card";
import { Workflow } from "../AppState";
import { message, Typography } from "antd";

// Show workflow selection screen
// New -> New workflow window
// Existing -> Load and proceed to MainNavigation


export const WorkflowSelection : React.FC = () => {
    const [wfs, setWfs] = useState<Workflow[]>([]);
    const navigate = useNavigate();

    const loadWorkflow = (name: string) => {
      window.stateAPI.setCurrentWorkflow(name).then(() => {
        message.success('Current workflow set successfully');
      }).catch((error) => {
        message.error('Error loading workflow: ' + error.message);
      });
      navigate("/sandbox");
    }
    
    const deleteWorkflow = (name: string) => {
      window.stateAPI.deleteWorkflow(name).then(() => {
        message.success('Workflow deleted successfully');
        window.stateAPI.getAppState().then(({ workflows, current }) => {
          setWfs(workflows);
        }).catch((error) => {
          message.error('Error fetching app state after deletion: ' + error.message);
        }
      ).catch((error) => {
        message.error('Error deleting workflow: ' + error.message);
      });
      });
    }

    useEffect(() => {
      window.stateAPI.getAppState().then(({ workflows, current }) => {
        setWfs(workflows);
        message.success('App state fetched successfully');
      }).catch((error) => {
        message.error('Error fetching app state: ' + error.message);
      });
    }, []);
      
    return (
        <div className="flex flex-col items-center w-screen h-screen bg-gray-100 p-4 gap-8">
            <Typography.Title level={1} style={{userSelect:'none'}}>Workflow Selection</Typography.Title>
        
            <div className=" overflow-y-auto">
            <div className="grid grid-cols-4 gap-4">
              <Button icon={Plus} label="New Workflow" onClick={() => navigate("/new-workflow")}/>
              {wfs.map((wf) => (
                <Card key={wf.name} label={wf.name} problemType={wf.problemType as 'regress' | 'classify'} onOpen={loadWorkflow} onDelete={deleteWorkflow} />
              ))}
            </div>
            </div>
        </div>
    );
}
