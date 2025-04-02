import React, { useState, ChangeEvent } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

const NewProjectMenu: React.FC = () => {
  const [projectName, setProjectName] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [projectType, setProjectType] = useState<'clustering' | 'predictions' | ''>('');
  const [datasetType, setDatasetType] = useState<'sequential' | 'non-sequential' | ''>('');
  const navigate = useNavigate();
  
    const handleBack = () => {
      
      navigate('/');
    };
    
  // Handle CSV file selection.
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      //Selected file name.
      setCsvFileName(e.target.files[0].name);
    } else {
      setCsvFileName('');
    }
  };

  const handleProjectTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProjectType(e.target.value as 'clustering' | 'predictions' | '');
    // Reset dataset type when switching type
    setDatasetType('');
  };

  const handleDatasetTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDatasetType(e.target.value as 'sequential' | 'non-sequential');
  };

    const handleCreate = () => {
      //log values or perform validation
      console.log({ projectName, csvFileName, projectType, datasetType });
      // Navigate to the NewProject page
      navigate('/new-project');
    };
    
 

  return (
    <div className="new-project-menu">
      <h2>Create New Project</h2>
      <div className="form-section">
        <label htmlFor="csvFile">CSV File:</label>
        <input type="file" id="csvFile" accept=".csv" onChange={handleFileChange} />
        {csvFileName && <span className="csv-name">{csvFileName}</span>}
      </div>

      <div className="form-section">
        <p>Project Type:</p>
        <label>
          <input
            type="radio"
            name="projectType"
            value="clustering"
            checked={projectType === 'clustering'}
            onChange={handleProjectTypeChange}
          />
          Clustering
        </label>
        <label>
          <input
            type="radio"
            name="projectType"
            value="predictions"
            checked={projectType === 'predictions'}
            onChange={handleProjectTypeChange}
          />
          Predictions
        </label>
      </div>

      {projectType === 'predictions' && (
        <div className="form-section">
          <p>Dataset Nature (only for predictions):</p>
          <label>
            <input
              type="radio"
              name="datasetType"
              value="sequential"
              checked={datasetType === 'sequential'}
              onChange={handleDatasetTypeChange}
            />
            Sequential
          </label>
          <label>
            <input
              type="radio"
              name="datasetType"
              value="non-sequential"
              checked={datasetType === 'non-sequential'}
              onChange={handleDatasetTypeChange}
            />
            Non-Sequential
          </label>
        </div>
      )}

      <div className="form-section">
      <button onClick={handleCreate}>Create</button>
      </div>
      <button onClick={handleBack}>Back</button>
    </div>
  );
};

export default NewProjectMenu;
