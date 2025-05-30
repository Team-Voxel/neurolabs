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
import { useWaitForComputationStore } from './WaitForComputation';


enum SetupSteps {
    Start = 0,
    SelectFile = 1,
    Finish = 2
}


type ColumnHeaderItem = { value: string };

export const WorkflowWizard: React.FC = () => {
const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('Enter a name');
  const [csvFile, setCsvFile] = useState<File|null>(null);
  const [dataSource, setDataSource] = useState<'file'|'generate'>('file');
  const [dataSummary, setDataSummary] = useState<DatasetSummary | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeaderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [problemType, setProblemType] = useState<string>('classify');

  const [wfs, setWfs] = useState<Workflow[]>([]);

  const [doneComputingStats, setDoneComputingStats] = useState<boolean>(false);

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
    setTargetColumn(null);
    setProblemType('auto');
    setColumnHeaders([]);
    setCsvFile(file);
    setDataSummary(null);
    setDoneComputingStats(false);

    if (file) {
      Papa.parse(file, {
        header: true,
        preview: 1,
        skipEmptyLines: true,
        complete: (results: ParseResult<unknown>) => {
          if (results.meta && results.meta.fields && results.meta.fields.length > 0) {
            setColumnHeaders(results.meta.fields.map(header => ({ value: header })));
            setError(null);
            // Set default target column to last column
            const lastColumn = results.meta.fields[results.meta.fields.length - 1];
            setTargetColumn(lastColumn);
            // Set default problem type
            setProblemType('auto');
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
      return false; // Prevent auto-upload
    } 
    return true; // Allow auto-upload
  };

  const onImportFile = () => {
    if (csvFile && targetColumn) {
      const sendSummaryRequest = async () => {
        try {
          const summary = await generateSummaryFromFile(csvFile.path, targetColumn, problemType);
          setDoneComputingStats(true);
          setDataSummary(summary);
          // Update problem type based on summary if auto was selected
          if (problemType === 'auto' && summary.problemType) {
            setProblemType(summary.problemType);
          }
        } catch (err) {
          console.error("Failed to fetch summary:", err);
        }
      } 
      sendSummaryRequest();
    }
  };

  const onDataGenerate = (data : DatasetSummary) => {
    setDataSummary(data);
    setDoneComputingStats(true);
  }

  const addNew = async () => {
    const wfDir = await window.wfStore.getWfDir(workflowName);
    if (!targetColumn) {
      throw new Error('Target column is required');
    }

    const newWf: Workflow = {
      name: workflowName,
      description: '',
      userModels: [],
      wfDir: wfDir,
      datafile: `${wfDir}//data.csv`,
      dataType: 'CSV',
      problemType: problemType,
      target: targetColumn,
    };
    useWorkflowStore.getState().addNew(newWf);
    useWorkflowStore.getState().setCurrentByName(workflowName);
  };

  const handleFinalization = () => {
    // finalize and navigate to the sandbox
    if (!targetColumn) {
      throw new Error('Target column is required');
    }
    if (!problemType) {
      throw new Error('Problem type is required');
    }

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
    else {
      // Read generated data from the temporary data file, copy it to the workflow directory
      window.fsAPI.getTempDatasetPath().then((tempDataLoc) => {
        window.wfStore.getWfDir(workflowName).then((wfdir) => {
          window.fsAPI.joinPath(wfdir, `data.csv`).then((newFileName) => {
            window.fsAPI.copyFile(tempDataLoc, newFileName).then(() => {
              console.log('File copied successfully');
            }).catch((error) => {
              console.error('Error copying file:', error);
            });
          });
        });
      });
    }
    
    const waitStore = useWaitForComputationStore.getState();
    window.wfStore.getWfDir(workflowName).then((wfdir) => {
      console.log('state vals: ', wfdir, problemType, targetColumn, `${wfdir}\\data.csv`);
      waitStore.setAll(wfdir, problemType, targetColumn, `${wfdir}\\data.csv`);
    });

    navigate('/wait-screen');
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
        <Splitter.Panel min='32%' max='50%' defaultSize={'32%'}>
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
                datasetSummary={dataSummary}
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
                onSendRequest={() => {setDoneComputingStats(false)}}
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
            <div className='flex max-h-full w-full overflow-auto'>
                <FeatureOverview datasetSummary={dataSummary} visible={doneComputingStats}/>
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