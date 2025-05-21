import React, { useState, ChangeEvent, useEffect } from 'react';
import './App.css';
import { data, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ImageButton from './components/ImageButton';
import Button from '@mui/material/Button';
import FileUpload from './components/fileUpload';
import { Workflow, useWorkflowStore } from './AppState';
import { Select, Slider, Switch, Radio, Typography} from 'antd';
import Settings from './components/settings/Settings';
import SettingControl from './components/settings/SettingsControl';
import { SettingControl as SettingControlType, SelectOption } from './components/settings/types';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

enum SetupSteps {
  Start = 0,
  SelectFile = 1,
  Finish = 4
}

enum ClusterTypes {
  Blobs = 0,
  Spherical = 1,
  Circles = 2,
  SCurve = 3,
  Spiral = 4,
  Moons = 5
}

enum RegressionGenStrat {
  Friedman1 = 0,
  Friedman2 = 1,
  Friedman3 = 2,
  Linear = 3,
  GaussianRBF = 4,
  RFF = 5,
  Sinusoidal = 6,
  GP = 7,
}

// Generation
// |-- Type: Classification
//      |-- Clusters
  //      |-- No features (number)
  //      |-- Shape (blobs/spherical/circles/s-curve/spiral)
  //      |-- 


const D2Clusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'Moons',
  value: ClusterTypes.Moons
},
{
  label: 'Circles',
  value: ClusterTypes.Circles
}];

const D3Clusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'S-Curve',
  value: ClusterTypes.SCurve
},
{
  label: 'Spiral',
  value: ClusterTypes.Spiral
}];

const HighDClusterings : SelectOption[]= [
{
  label: 'Blobs',
  value: ClusterTypes.Blobs
},
{
  label: 'Spherical',
  value: ClusterTypes.Spherical
}];


const DataGeneration : React.FC = () => {
  const [datasetType, setDatasetType] = useState<'classify' | 'regress'>('classify');
  const [isClusters, setIsClusters] = useState<boolean>(true);
  const [cluserType, setClusterType] = useState<ClusterTypes>(ClusterTypes.Blobs);
  const [nClusters, setNClusters] = useState<number>(3);
  const [clusterDispersion, setClusterDispersion] = useState<number>(0.5);
  const [dimensionality, setDimensionality] = useState<'2D' | '3D' | 'High Dimensional'>('2D');
  const [nFeatures, setNFeatures] = useState<number>(2);
  const [nInformative, setNInformative] = useState<number>(2);
  const [nRedundant, setNRedundant] = useState<number>(0);
  const [nSamples, setNSamples] = useState<number>(10000);
  const [randomState, setRandomState] = useState<number>(3);
  const [noise, setNoise] = useState<number>(1.0);

  const [regGenStrat, setRegGenStrat] = useState<RegressionGenStrat>(RegressionGenStrat.Linear);

  const updateFeatureCountsFromRedn = (nRed) => {
    setNRedundant(nRed);
    setNInformative(nFeatures - nRed);
  }

  const updateFeatureCountsFromInf = (nInf) => {
    setNInformative(nInf);
    setNRedundant(nFeatures - nInf);
  }

  const updateDimensionality = (dim) => {
    setDimensionality(dim);
    if (dim === '2D')
      setNFeatures(2);
    else if (dim === '3D')
      setNFeatures(3);
  }

  const updateRegressionStrat = (strat) => {
    switch (strat) {
      case RegressionGenStrat.Friedman1:
        setNFeatures(5)
        break;
      case RegressionGenStrat.Friedman2:
      case RegressionGenStrat.Friedman3:
        setNFeatures(4);
        break;
    }
    setRegGenStrat(strat);
  }
  
  const regBool = !(regGenStrat === RegressionGenStrat.Friedman1 || regGenStrat === RegressionGenStrat.Friedman2 || regGenStrat === RegressionGenStrat.Friedman3);
  const classficationSettings: SettingControlType[] = [
    {
      id: 'datasetType',
      label: 'Dataset Type',
      type: 'select',
      options: [
        { label: 'Classification', value: 'classify' },
        { label: 'Regression', value: 'regress' }
      ],
      value: datasetType,
      onChange: (value) => setDatasetType(value),
      tooltip: 'Select the type of dataset to generate',
      visible: true
    },
    {
      id: 'nSamples',
      label: 'Number of samples',
      type: 'number',
      value: nSamples,
      min: 100,
      max: 1000000,
      step: 100,
      onChange: (value) => setNSamples(value),
      tooltip: 'Number of samples to generate',
      visible: true
    },
    {
      id: 'dimensionality',
      label: 'Dimensionality',
      type: 'select',
      options: [
        { label: '2D', value: '2D' },
        { label: '3D', value: '3D' },
        { label: 'High Dimensional', value: 'High Dimensional' }
      ],
      value: dimensionality,
      onChange: (value) => updateDimensionality(value),
      tooltip: 'Select the dimensionality of the data',
      visible: regBool
    },
    {
      id: 'nFeatures',
      label: 'Number of features',
      type: 'slider',
      value: nFeatures,
      min: 1,
      max: 20,
      step: 1,
      onChange: (value) => setNFeatures(value),
      tooltip: 'Number of features to generate',
      visible: dimensionality === 'High Dimensional' && regBool
    },
    {
      id: 'seed',
      label: 'Generation Seed',
      type: 'number',
      value: randomState,
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      step: 1,
      onChange: (value) => setRandomState(value),
      tooltip: 'Seed used in generation',
      visible: true
    },
    {
      id: 'isClusters',
      label: 'Generate Clusters',
      type: 'switch',
      value: isClusters,
      onChange: (value) => setIsClusters(value),
      tooltip: 'Determine whether the generator makes clusters or not',
      visible: true && datasetType === 'classify'
    },
    {
      id: 'clusterType',
      label: 'Cluster Type',
      type: 'select',
      options: dimensionality === '2D' ? D2Clusterings : dimensionality === '3D' ? D3Clusterings : HighDClusterings,
      value: cluserType,
      onChange: (value) => {setClusterType(value); if (value === ClusterTypes.Circles) setNFeatures(2);},
      tooltip: 'Select the cluster type',
      visible: isClusters && datasetType === 'classify'
    },
    {
      id: 'nclusters',
      label: 'Number of clusters',
      type: 'slider',
      value: nClusters,
      min: 1,
      max: 10,
      step: 1,
      onChange: (value) => setNClusters(value),
      tooltip: 'Select the number of clusters',
      visible: isClusters && cluserType === ClusterTypes.Blobs && datasetType === 'classify'
    },
    {
      id: 'clusterDispersion',
      label: 'Dispersion',
      type: 'number',
      value: clusterDispersion,
      min: 0,
      max: 5,
      step: 0.01,
      onChange: (value) => setClusterDispersion(value),
      tooltip: 'Standard deviation of the clusters',
      visible: isClusters && cluserType === ClusterTypes.Blobs && datasetType === 'classify'
    },
    {
      id: 'nInformative',
      label: 'Informative features',
      type: 'slider',
      value: nInformative,
      min: 1,
      max: nFeatures - nRedundant,
      step: 1,
      onChange: (value) => updateFeatureCountsFromInf(value),
      tooltip: 'Number of informative features',
      visible: !isClusters && datasetType === 'classify'
    },
    {
      id: 'nRedundant',
      label: 'Redundant features',
      type: 'slider',
      value: nRedundant,
      min: 0,
      max: nFeatures - nInformative,
      step: 1,
      onChange: (value) => updateFeatureCountsFromRedn(value),
      tooltip: 'Number of redundant features',
      visible: !isClusters && datasetType === 'classify'
    },
    {
      id: 'dxr',
        label: 'Generation Strategy',
      type: 'select',
      value: regGenStrat,
      options: [
        { label: 'Linear', value: RegressionGenStrat.Linear },
        { label: 'Non Linear Interactions', value: RegressionGenStrat.Friedman1 },
        { label: 'Non Linear Division', value: RegressionGenStrat.Friedman2 },
        { label: 'Non Linear Singularities', value: RegressionGenStrat.Friedman3 },
        { label: 'Gaussian Mixture', value: RegressionGenStrat.GaussianRBF },
        { label: 'Fourier Features', value: RegressionGenStrat.RFF },
        { label: 'Sinusoidal Features', value: RegressionGenStrat.Sinusoidal },
        { label: 'Gaussian Process', value: RegressionGenStrat.GP }
      ],
      onChange: (value) => updateRegressionStrat(value),
      tooltip: 'Select the generation strategy',
      visible: datasetType === 'regress'
    },
    {
      id: 'noise',
      label: 'Noise',
      type: 'number',
      value: noise,
      min: 0.01,
      max: 10,
      step: 0.01,
      onChange: (value) => setNoise(value),
      tooltip: 'Standard deviation of the noise added to the data. (Only when applicable)',
      visible: true
    },
  ];
  
  {/* <div className='flex w-full h-full justify-center items-center '>
    <Settings controls={classficationSettings} />
    </div> */}
    
  return (
    <div className='flex w-full h-full justify-center items-center'>
  <div className='flex flex-col text-gray-800 w-full h-full overflow-auto'>
    <div>
      {classficationSettings.map((control) => (
        control.visible && <SettingControl key={control.id} control={control} />
      ))}
    </div>
  </div>
</div>
  );
}


function ProjectSetupWizard() {
  const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('Enter a name');
  const [csvFile, setCsvFile] = useState<File|null>(null);
  const [dataSource, setDataSource] = useState<'file'|'generate'>('generate');
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
        setNameError('Name already exists');
        return;
      }
    });
    if (name.length < 3) {
      setNameError('Name too short');
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
        <div className='flex flex-row h-full'>
        {/* Left side : Selections */}
        <div className='w-2/5 h-full flex flex-col border p-4'>
          <div className='flex items-center'>
            <ToggleButtonGroup
              color="primary"
              value={dataSource}
              exclusive
              onChange={(e, src) => setDataSource(src)}
              aria-label="Platform"
              size="small"
              fullWidth
            >
              <ToggleButton fullWidth value="file" aria-label="file">Import</ToggleButton>
              <ToggleButton fullWidth value="generate" aria-label="generate">Generate</ToggleButton>
            </ToggleButtonGroup>
          </div>
      
          {/* Conditional sections */}
          <div className='flex-grow mt-8 overflow-hidden'>
            {dataSource === 'file' && (
              <div className='flex flex-col gap-4 items-center'>
                <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '50ch' } }} noValidate autoComplete="off">
                  <FileUpload
                    accept=".csv"
                    maxSize={10000000}
                    onChange={handleFileChange}
                    buttonText="Choose CSV File"
                  />
                  <div className='flex flex-row justify-items-stretch gap-4'>
                    <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
                    {csvFile && <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.Finish)}>Next</Button>}
                  </div>
                </Box>
              </div>
            )}
      
            {dataSource === 'generate' && (
              <div className='flex flex-col h-full'>
                <Typography.Title>Select Generation Parameters</Typography.Title>
                <div className='flex-grow overflow-y-auto'>
                  <DataGeneration />
                </div>
                <div className='flex flex-row w-full justify-items-stretch gap-4 mt-4'>
                  <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
                  <Button fullWidth variant="contained" onClick={() => setStep(SetupSteps.Finish)}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      
        {/* Right side : Preview */}
        <div className='w-3/5 h-full flex flex-col'>
          Right Side
        </div>
      </div>
      
      )}
      {step === SetupSteps.Finish && (
        <div className="h-full flex flex-col justify-center items-center">
          <Box component="form" sx={{ '& > :not(style)': { m: 4, width: '25ch' } }} noValidate autoComplete="off">
            <h1>Setup Complete!</h1>
            <Button fullWidth variant="contained" onClick={() => handleBack()}>Back</Button>
            <Button variant="contained" onClick={() => handleFinalization()}>Finish</Button>
          </Box>
        </div>
      )}
    </div>
  );
}

export default ProjectSetupWizard;
