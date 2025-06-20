import React, {useState, useEffect, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Button from "./CreateNewButton";
import Plus from "../assets/plus.png"
import {Card} from "./Card";
import { Workflow } from "../AppState";
import { message, Typography } from "antd";
import { PackagePlus } from "lucide-react";

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
              <AddNewButton onClick={() => navigate("/new-workflow")}/>
              {wfs.map((wf) => (
                <Card key={wf.name} label={wf.name} problemType={wf.problemType as 'regress' | 'classify'} onOpen={loadWorkflow} onDelete={deleteWorkflow} />
              ))}
            </div>
            </div>
        </div>
    );
}



const AddNewButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {

  return (
    <div className={`
      relative flex flex-col rounded-xl overflow-hidden
      min-h-54 min-w-64 flex-1
      transition-all duration-300 ease-in-out transform
      bg-white border-2 border-gray-200 shadow-md 
      hover:shadow-xl hover:border-gray-300
      hover:shadow-2xl
      group
    `}
      onClick={onClick}>
      {/* Top 2/3 - Image/Icon Section */}
      <div className="flex-[2] p-4 transition-transform duration-300 group-hover:scale-105">
        <PackagePlus size={128} className="text-blue-600 mx-auto" />
      </div>

      {/* Bottom 1/3 - Label and Buttons Section */}
      <div className="flex-1 flex flex-col justify-between p-4 pt-2 bg-gray-50 border-t border-gray-100">
        {/* Label */}
        <div className="flex items-center justify-center mb-3">
          <Typography.Title level={4} style={{userSelect: 'none'}}>
            Add New Workflow
          </Typography.Title>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                      bg-gradient-to-r from-blue-400/5 to-purple-400/5 group-hover:opacity-100
                      pointer-events-none">
      </div>
    </div>
  );

}