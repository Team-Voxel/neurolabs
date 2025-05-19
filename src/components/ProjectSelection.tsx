import React from "react";
import { useNavigate } from "react-router-dom";
import Button from './CreateNewButton'
import plusIcon from '../assets/plus.svg'
import open from '../assets/folder-input.svg'

export const ProjectSelection: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateNewProject = () => {
      navigate('/create-new-project');
    };

    const gotoNodes = () => {
      navigate('/nodes');
    };
    
    return (
        <>
          <div className='flex flex-col gap-20'>
    
            <div>
              <div className='text-black text-6xl'>Select a Project</div>
            </div>
            <div className='flex align-middle justify-center gap-24 '>
              <Button icon={plusIcon} label="Create New Project" onClick={handleCreateNewProject}/>
              <Button icon={open} label="Open Recent Project" onClick={gotoNodes}/>
            </div>
             
          </div>
        </>
      );
}