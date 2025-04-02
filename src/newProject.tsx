import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
interface DataRow {
  col1: string;
  col2: string;
  col3: string;
}

const NewProject: React.FC = () => {
  const [dataset, setDataset] = useState<DataRow[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const navigate = useNavigate();

  const handleBack = () => {
    
    navigate('/');
  };
 
  const handleBackToNewProject = () => {
      
    navigate('/create-new-project');
  };
  const handleImportDataset = () => {
    // Simulate dataset import (replace with real file import logic)
    const sampleData: DataRow[] = [
      { col1: 'Data 1', col2: 'Data 2', col3: 'Data 3' },
      { col1: 'Data 4', col2: 'Data 5', col3: 'Data 6' },
    ];
    setDataset(sampleData);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  return (
    <div className="new-project-window">
      <header>
        <h2>Data Import & Model Training</h2>
      </header>
      <main className="content">
        <div className="layout-container">
          {/* left side: Controls */}
          <section className="controls">
          <select value={selectedModel} onChange={handleModelChange}>
              <option value="">Select Model</option>
              <option value="svm">SVM</option>
              <option value="randomForest">Random Forest</option>
              <option value="ann">ANN</option>
            </select>
            <button>View</button>
            <button>Analyze</button>
            <button onClick={handleImportDataset}>Display Dataset</button>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleBackToNewProject}>Choose Another Dataset</button>
          </section>
          {/* Right side: Dataset display */}
          <section className="dataset-display">
            {dataset.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Column 1</th>
                    <th>Column 2</th>
                    <th>Column 3</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.map((row, index) => (
                    <tr key={index}>
                      <td>{row.col1}</td>
                      <td>{row.col2}</td>
                      <td>{row.col3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No dataset loaded yet.</p>
            )}
            
          </section>
        </div>
      </main>
    </div>
  );
};

export default NewProject;
