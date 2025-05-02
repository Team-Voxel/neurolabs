import React, { useState, ChangeEvent } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ImageButton from './components/ImageButton';
import Button from '@mui/material/Button';
import FileUpload from './components/fileUpload';


enum SetupSteps {
  Start = 0,
  SelectFile = 1,
  ProjectType = 2,
  DatasetType = 3,
  PredFinish = 4,
  ClusterFinish = 5
}



function ProjectSetupWizard() {
  const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [projectName, setProjectName] = useState<string>('');
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [projectType, setProjectType] = useState<'clustering' | 'prediction' | ''>('');
  const [datasetType, setDatasetType] = useState<'sequential' | 'non-sequential' | ''>('');
  const navigate = useNavigate();

  const handleBack = () => {
    if (step == SetupSteps.Start) {
      navigate('/');
    }
    setStep(step == SetupSteps.ClusterFinish ? SetupSteps.ProjectType : step - 1);
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setCsvFileName(file.name);
    } else {
      setCsvFileName('');
    }
  };

  const handleProjectTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProjectType(e.target.value as 'clustering' | 'prediction' | '');
    // Reset dataset type when switching type
    setDatasetType('');
  };

  const handleDatasetTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDatasetType(e.target.value as 'sequential' | 'non-sequential');
  };

  const handleFinalization = () => {
    // finalize and navigate to the dashboard
    console.log({ projectName, csvFileName, projectType, datasetType });
    navigate('/workflow');
  };

  return (
    // top most container
    <div className="flex flex-col gap-20 h-full justify-center">
      {step === SetupSteps.Start && (
        <div>
          <div className='justify-center items-center flex flex-col gap-4'>
            <h1 className="text-xl font-semibold mb-2">Let's make a new project.</h1>
            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '50ch' } }} noValidate autoComplete="off">
              <TextField label="Project Name" variant="outlined" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <div className='flex flex-row justify-items-stretch gap-4'>
              <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
              <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.SelectFile)}>Next</Button>
            </div>

            </Box>
          </div>
        </div>
      )}
      {step === SetupSteps.SelectFile && (
        <div>
          <div className='justify-center items-center flex flex-col gap-4'>
            <h1 className="text-xl font-semibold mb-2">Select your dataset</h1>
            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '50ch' } }} noValidate autoComplete="off">
              <FileUpload
                accept=".csv"
                maxSize={5000000} // 5MB
                onChange={handleFileChange}
                buttonText="Choose CSV File"
              />
              <div className='flex flex-row justify-items-stretch gap-4'>
                <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
                <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.ProjectType)}>Next</Button>
              </div>

            </Box>
          </div>
        </div>
      )}
      {step === SetupSteps.ProjectType && (
        <div className="h-full flex flex-col justify-center items-center">
          <h1>What do you want to do?</h1>
          <div className='flex flex-row align-center m-4 gap-4'>
            <ImageButton imageUrl='.assets/plus.png' title="Predict" width='300px' height='200px' onClick={() => {setStep(SetupSteps.DatasetType); setProjectType("prediction")}} />
            <ImageButton imageUrl='.assets/plus.png' title="Cluster" width='300px' height='200px' onClick={() => {setStep(SetupSteps.ClusterFinish); setProjectType("clustering")}} />
          </div>
          <Box component="form" sx={{width: '50ch'}} noValidate autoComplete="off">
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
          </Box>
        </div>
      )}
      {step === SetupSteps.DatasetType && (
        <div className="h-full flex flex-col justify-center items-center">
          <h1>Dataset Nature</h1>
          <div className='flex flex-row align-center m-4 gap-4'>
            <ImageButton imageUrl='.assets/plus.png' title="Sequential" width='300px' height='200px' onClick={() => {setStep(SetupSteps.PredFinish); setDatasetType("sequential")}} />
            <ImageButton imageUrl='.assets/plus.png' title="None Sequential" width='300px' height='200px' onClick={() => {setStep(SetupSteps.PredFinish); setDatasetType("non-sequential")}} />
          </div>
          <Box component="form" sx={{width: '50ch'}} noValidate autoComplete="off">
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
          </Box>
        </div>
      )}
      {step === SetupSteps.PredFinish && (
        <div className="h-full flex flex-col justify-center items-center">
          <Box component="form" sx={{ '& > :not(style)': { m: 4, width: '25ch' } }} noValidate autoComplete="off">
            <h1>Prediction setup complete!</h1>
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
            <Button variant="contained" onClick={() => handleFinalization()}>Finish</Button>
          </Box>
        </div>
      )}
      {step === SetupSteps.ClusterFinish && (
        <div className="h-full flex flex-col justify-center items-center">
          <Box component="form" sx={{ '& > :not(style)': { m: 4, width: '25ch' } }} noValidate autoComplete="off">
            <h1>Clustering setup complete!</h1>
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
            <Button variant="contained" onClick={() => handleFinalization()}>Finish</Button>
          </Box>
        </div>
      )}
    </div>
  );
}

export default ProjectSetupWizard;
