import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Workflow, useWorkflowStore } from '../../AppState';
import { Button, Splitter} from 'antd';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { TableColumnsType, TableProps } from 'antd';
import {generateSummaryFromFile} from '../../backend_api/data_api';
import type { DatasetSummary, DataSummaryEntry } from '../../backend_api/types';
import Papa, {ParseResult} from 'papaparse';
import { FileImportFragment } from './FileImportFrag';
import { FeatureOverview, TargetOverview } from './DatasetPreview';
import { DataGeneration } from './GenerationUI';


enum SetupSteps {
    Start = 0,
    SelectFile = 1,
    Finish = 4
}


type ColumnHeaderItem = { value: string };

export const WorkflowWizard: React.FC = () => {
const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('Enter a name');
  const [csvFile, setCsvFile] = useState<File|null>(null);
  const [dataSource, setDataSource] = useState<'file'|'generate'>('generate');
  const [dataSummary, setDataSummary] = useState<DatasetSummary | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeaderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [problemType, setProblemType] = useState<string>('classification');

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

  const onImportFile = () => {
    if (csvFile && targetColumn) {
      
      const sendSummaryRequest = async () => {
        try {
          const summary = await generateSummaryFromFile(csvFile.path, targetColumn, problemType);
          setDataSummary(summary);
        } catch (err) {
          console.error("Failed to fetch summary:", err);
        }
      } 
      sendSummaryRequest();
      console.log(dataSummary)
    }
  };

  const handleFileChange = (file: File | null) => {
    setTargetColumn(null);
    setProblemType('auto');
    
    if (file) {

      Papa.parse(file, {
        header: true,
        preview: 1,
        skipEmptyLines: true,
        complete: (results: ParseResult<unknown>) => {
          if (results.meta && results.meta.fields && results.meta.fields.length > 0) {
            setColumnHeaders(results.meta.fields.map(header => ({ value : header })));
            setError(null);
            setTargetColumn(results.meta.fields[results.meta.fields.length - 1] || null);
          } else if (results.errors && results.errors.length > 0) {
            setError(`Error parsing CSV: ${results.errors[0].message}`);
            setColumnHeaders([]);
          }
          else {
            setError('Could not extract headers. The CSV might be empty, not have a header row, or is improperly formatted.');
            setColumnHeaders([]);
          }
        },
        error: (err: Error) => {
          setError(`Error parsing CSV: ${err.message}`);
          setColumnHeaders([]);
        },
      });

      setCsvFile(file);
    } else {
      setCsvFile(null);
    }
    return false; // Prevent auto-upload
  };

  const onDataGenerate = (data : DatasetSummary) => {
    setDataSummary(data);
  }

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
    // finalize and navigate to the sandbox
    addNew();
    if (dataSource === 'file'){
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
    }
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
              <Button block type="primary" onClick={() => handleBack()}>Back</Button>
              {nameError === 'none' && <Button block type="primary" onClick={() => {setStep(SetupSteps.SelectFile)}}>Next</Button>}
            </div>

            </Box>
          </div>
        </div>
      )}
      {step === SetupSteps.SelectFile && (
        <Splitter>
        {/* Left side : Selections */}
        <Splitter.Panel min='30%' max='50%'>
        <div className='w-full h-full flex flex-col border p-4'>
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
          <div className='flex-grow h-full overflow-hidden'>
            {dataSource === 'file' &&
              <FileImportFragment
                targetColumn={targetColumn || ''}
                problemType={problemType}
                columnHeaders={columnHeaders}
                onFileChange={handleFileChange}
                onBack={handleBack}
                onImport={onImportFile}
                onSelectTargetColumn={(value) => setTargetColumn(value)}
                onSelectProblemType={(value) => setProblemType(value)}
                onNext={() => {setStep(SetupSteps.Finish)}}
                />
            }
      
            {dataSource === 'generate' && (
              <DataGeneration
                onGenerate={onDataGenerate}
                onBack={handleBack}
                onNext={() => {setStep(SetupSteps.Finish)}}
                />
            )}
          </div>
        </div>
        </Splitter.Panel>
      
        {/* Right side : Preview */}
        <Splitter.Panel>
        {dataSummary && 
        <div className='w-full h-full flex flex-col'>
            <div className='flex-1 h-1/2 w-full overflow-auto'>
                <FeatureOverview datasetSummary={dataSummary} visible={true}/>
            </div>
            <div className='flex h-1/2'>
                <TargetOverview datasetSummary={dataSummary} visible={true}/>
            </div>
        </div>
        }
        </Splitter.Panel>
      
      </Splitter>
      )}
      {step === SetupSteps.Finish && (
        <div className="h-full flex flex-col justify-center items-center">
          <Box component="form" sx={{ '& > :not(style)': { m: 4, width: '25ch' } }} noValidate autoComplete="off">
            <h1>Setup Complete!</h1>
            <Button block type="primary" onClick={handleBack}>Back</Button>
            <Button block type="primary" onClick={handleFinalization}>Finish</Button>
          </Box>
        </div>
      )}
    </div>
  );
}