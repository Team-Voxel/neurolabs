import React, { useState, ChangeEvent, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ImageButton from './components/ImageButton';
import Button from '@mui/material/Button';
import FileUpload from './components/fileUpload';
import { Workflow, useWorkflowStore } from './AppState';
import { Select, Slider, Switch, Radio} from 'antd';

enum SetupSteps {
  Start = 0,
  SelectFile = 1,
  DatasetType = 3,
  Finish = 4
}

enum ClusterTypes {
  Blobs = 0,
  Spherical = 1,
  Circles = 2,
  SCurve = 3,
  Spiral = 4
}

// Generation
// |-- Type: Classification
//      |-- Clusters
  //      |-- No features (number)
  //      |-- Shape (blobs/spherical/circles/s-curve/spiral)
  //      |-- 

const DataGeneration : React.FC = () => {
  const [datasetType, setDatasetType] = useState<'classify' | 'regress'>('classify');
  const [isClusters, setIsClusters] = useState<boolean>(true);
  const [cluserType, setClusterType] = useState<ClusterTypes>(ClusterTypes.Blobs);
  const [nClusters, setNClusters] = useState<number>(3);
  const [nFeatures, setNFeatures] = useState<number>(2);
  const [nInformative, setNInformative] = useState<number>(2);
  const [nRedundant, setNRedundant] = useState<number>(0);
  const [nSamples, setNSamples] = useState<number>(100);
  const [randomState, setRandomState] = useState<number>(3);
  const [noise, setNoise] = useState<number>(0.0);
  

  return (
    <div className='flex flex-col'>
      <Select
        defaultValue="classify"
        style={{ width: 120 }}
        onChange={(v) => setDatasetType(v as 'classify' | 'regress')}
        options={[
          { value: 'classify', label: 'Classification' },
          { value: 'regress', label: 'Regression' },
        ]}
      />
      <Slider defaultValue={2} value={nFeatures} onChange={(v) => setNFeatures(v)} step={1} min={1} max={20}/>
      {datasetType === 'classify' && 
        <>
          <Switch defaultChecked onChange={(v) => setIsClusters(v)} title='Make Clusers'/>
        </>
      }
    </div>
  );
}


function ProjectSetupWizard() {
  const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('none');
  const [csvFile, setCsvFile] = useState<File|null>(null);
  const [dataSource, setDataSource] = useState<'file'|'generated'>('generated');
  const [datasetType, setDatasetType] = useState<'sequential' | 'non-sequential' | ''>('');

  const [wfs, setWfs] = useState<Workflow[]>([]);

  useEffect(() => {
    setWfs(useWorkflowStore.getState().workflows);
  }, []);

  const navigate = useNavigate();

  const handleBack = () => {
    if (step == SetupSteps.Start) {
      navigate('/workflow-selection');
    }
    setStep(step - 1);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    
    setWorkflowName(name);
    wfs.forEach((wf) => {
      if (wf.name === name) {
        setNameError('name already exists');
        return;
      }
    });
    if (name.length < 3) {
      setNameError('name too short');
      return;
    }
    setNameError('none');
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setCsvFile(file);
    } else {
      setCsvFile(null);
    }
  };

  const handleDatasetTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDatasetType(e.target.value as 'sequential' | 'non-sequential');
  };

  const addNew = async () => {
    const wfDir = await window.wfStore.getWfDir(workflowName);
    const newWf: Workflow = {
      name: workflowName,
      description: '',
      userModels: [],
      wfDir: wfDir,
      datafile: `${wfDir}//data.csv`,
      dataType: 'CSV',
    };
    useWorkflowStore.getState().addNew(newWf);
    useWorkflowStore.getState().setCurrentByName(workflowName);
  };

  const handleFinalization = () => {
    // finalize and navigate to the dashboard
    addNew();
    const ext = csvFile!.name.split('.').pop();
      window.wfStore.getWfDir(workflowName).then((wfdir) => {
        window.fsAPI.joinPath(wfdir, `data.${ext}`).then((newFileName) => {
          window.fsAPI.copyFile(csvFile!.path, newFileName).then(() => {
            console.log('File copied successfully');
          }).catch((error) => {
            console.error('Error copying file:', error);
          });
        });
      });
    navigate('/sandbox');
  };

  return (
    // top most container
    <div className="flex flex-col gap-20 h-full justify-center">
      {step === SetupSteps.Start && (
        <div>
          <div className='justify-center items-center flex flex-col gap-4'>
            <h1 className="text-xl font-semibold mb-2">Let's make a new project.</h1>
            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '50ch' } }} noValidate autoComplete="off">
              <TextField label="Project Name" variant="outlined" value={workflowName} onChange={handleNameChange} />
              {nameError !== 'none' && <p className='text-red-500'>{nameError}</p>}
            <div className='flex flex-row justify-items-stretch gap-4'>
              <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
              {nameError === 'none' && <Button fullWidth variant="contained" onClick={() => {setStep(SetupSteps.SelectFile)}}>Next</Button>}
            </div>

            </Box>
          </div>
        </div>
      )}
      {step === SetupSteps.SelectFile && (
        <div>
          <h1 className="text-xl font-semibold mb-2">Select your dataset</h1>
          <Radio.Group value={dataSource} onChange={(e) => {setDataSource(e.target.value)}} style={{ marginBottom: 16 }}>
            <Radio.Button value="file">Import</Radio.Button>
            <Radio.Button value="generated">Generate</Radio.Button>
          </Radio.Group>
          {dataSource === 'file' && <div className='justify-center items-center flex flex-col gap-4'>
            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '50ch' } }} noValidate autoComplete="off">
              <FileUpload
                accept=".csv"
                maxSize={10000000} // 10MB
                onChange={handleFileChange}
                buttonText="Choose CSV File"
              />
              <div className='flex flex-row justify-items-stretch gap-4'>
              <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
              {csvFile && <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.Finish)}>Next</Button>}
              </div>
            </Box>
          </div>}
          {dataSource === 'generated'  && <div className='justify-center items-center flex flex-col gap-4'>
            <DataGeneration />
            <div className='flex flex-row justify-items-stretch gap-4'>
              <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
              {csvFile && <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.Finish)}>Next</Button>}
            </div>
          </div>}
        </div>
      )}
      {step === SetupSteps.DatasetType && (
        <div className="h-full flex flex-col justify-center items-center">
          <h1>Dataset Nature</h1>
          <div className='flex flex-row align-center m-4 gap-4'>
            <ImageButton imageUrl='.assets/plus.png' title="Sequential" width='300px' height='200px' onClick={() => {setStep(SetupSteps.Finish); setDatasetType("sequential")}} />
            <ImageButton imageUrl='.assets/plus.png' title="None Sequential" width='300px' height='200px' onClick={() => {setStep(SetupSteps.Finish); setDatasetType("non-sequential")}} />
          </div>
          <Box component="form" sx={{width: '50ch'}} noValidate autoComplete="off">
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
          </Box>
        </div>
      )}
      {step === SetupSteps.Finish && (
        <div className="h-full flex flex-col justify-center items-center">
          <Box component="form" sx={{ '& > :not(style)': { m: 4, width: '25ch' } }} noValidate autoComplete="off">
            <h1>Prediction setup complete!</h1>
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
            <Button variant="contained" onClick={() => handleFinalization()}>Finish</Button>
          </Box>
        </div>
      )}
    </div>
  );
}

export default ProjectSetupWizard;
