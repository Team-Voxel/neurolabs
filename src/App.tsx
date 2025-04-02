
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';


// Extend the Window interface to include electronAPI
declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => void;
    };
  }
}

import plusIcon from './assets/plus.svg'
import open from './assets/folder-input.svg'
import './App.css'
import Button from './components/createNewButton'
import CreateProjectPage from './newProject';
import NewProjectMenu from './newProjectMenu';

function App() {
  // const [count, setCount] = useState(0)
  const HomePage = () => {
    const navigate = useNavigate();

    const handleCreateNewProject = () => {
      navigate('/create-new-project');
    };
  return (
    <>
      <div className='flex flex-col gap-20'>

        <div>
          <div className='text-black text-6xl'>Select a Project</div>
        </div>
        <div className='flex align-middle justify-center gap-24 '>
          <Button icon={plusIcon} label="Create New Project" onClick={handleCreateNewProject}/>
          <Button icon={open} label="Open Recent Project" />
        </div>
         
      </div>
    </>
  );
  };

return (
  <HashRouter>
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/create-new-project" element={<NewProjectMenu />} />
      <Route path="/new-project" element={<CreateProjectPage />} />
    </Routes>
  </HashRouter>
);
}

export default App
