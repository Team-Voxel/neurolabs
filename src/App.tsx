

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

function App() {
  // const [count, setCount] = useState(0)

  const handleCreateProject = () => {
    window.electronAPI.openFileDialog()
  };
  const handleOpenProject = () => {
    console.log("Create New Project clicked");
  };

  return (
    <>
      <div className='flex flex-col gap-20'>

        <div>
          <div className='text-black text-6xl'>Select a Project</div>
        </div>
        <div className='flex align-middle justify-center gap-24 '>
          <Button icon={plusIcon} label="Create New Project" onClick={handleCreateProject} />
          <Button icon={open} label="Open Recent Project" onClick={handleOpenProject} />
        </div>
         
      </div>
    </>
  )
}

export default App
