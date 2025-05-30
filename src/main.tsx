import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useWorkflowStore } from './AppState.ts'

function Root() {
  React.useEffect(() => {
    useWorkflowStore.getState().loadAll()
  }, [])

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);

// Use contextBridge
/* window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
 */