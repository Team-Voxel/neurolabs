import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, message, Splitter, Typography} from 'antd';
import {generateSummaryFromFile, applyPreprocess} from '../../backend_api/data_api';
import type { DatasetSummary} from '../../backend_api/types';
import Papa, {ParseResult} from 'papaparse';
import { FileImportFragment } from './FileImportFrag';
import { FeatureOverview} from './DatasetPreview';
import { useWaitForComputationStore } from './WaitForComputation';
import { PreprocessModal } from './Preprocess';
import { Workflow } from '../../AppState';


enum SetupSteps {
    Start = 0,
    SelectFile = 1,
    Finish = 2,
}


type ColumnHeaderItem = { value: string };

export const WorkflowWizard: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [step, setStep] = useState<SetupSteps>(SetupSteps.Start);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('Enter a name');
  const [csvFile, setCsvFile] = useState<File|null>(null);
  const [dataSource, _setDataSource] = useState<'file'|'generate'>('file');
  const [dataSummary, setDataSummary] = useState<DatasetSummary | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeaderItem[]>([]);
  const [_error, setError] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [problemType, setProblemType] = useState<string>('classify');

  const [preprocessModalOpen, setPreprocessModalOpen] = useState<boolean>(false);
  const [preprocessMissingImputation, setPreprocessMissingImputation] = useState<string>("none");
  const [preprocessOutlierDetection, setPreprocessOutlierDetection] = useState<boolean>(false);
  const [preprocessFeatureScaling, setPreprocessFeatureScaling] = useState<string>("standardize");

  const [doneComputingStats, setDoneComputingStats] = useState<boolean>(false);
  
  const handlePreprocess = (missingImputation: string, outlierDetection: boolean, featureScaling: string) => {
    setPreprocessMissingImputation(missingImputation);
    setPreprocessOutlierDetection(outlierDetection);
    setPreprocessFeatureScaling(featureScaling);
    setPreprocessModalOpen(false);
    setStep(SetupSteps.Finish);
  }

  useEffect(() => {
    window.stateAPI.getAppState().then(({workflows}) => {
      setWorkflows(workflows);
      message.success('Loaded workflows.');
    }).catch(error => {
      message.error("Could't load workflows." + error);
    })
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
    
    if (workflows.some(item => item.name === name)) {
      setNameError('Name already exists');
      return;
    }
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

  const addNew = async () => {
    if (!targetColumn) {
      message.error('Target column is required');
      return;
    }
    if (!problemType) {
      message.error('Problem type is required');
      return;
    }

    /* window.stateAPI.addNewWorkflowAndSet(workflowName, problemType, targetColumn).then((wf) => {
      message.success('Workflow created successfully');
      setStep(SetupSteps.Finish);
    }).catch(error => {
      message.error('Error creating workflow: ' + error.message);
    }) */

    return;
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
    let dataPath = '';
    if (dataSource === 'file'){
      if (!csvFile) {
        message.error('No CSV file selected');
        return;
      }
      dataPath = csvFile.path;
    }
    else {
      window.stateAPI.getDataPath().then(datapath => {
        dataPath = datapath + 'tempdata.csv';
      });
    }
    console.log("Data path: ", dataPath);
    window.stateAPI.copyDataFileToWFDir(dataPath, workflowName).then(() => {
      message.info('Generated data copied successfully');
    }).catch((error) => {
      message.error('Error copying generated data:', error);
    });

    // apply preprocessing
    window.wfStore.getWfDir(workflowName).then((wfdir) => {
      applyPreprocess({
        impute: preprocessMissingImputation,
        scale: preprocessFeatureScaling,
        outlierAction: preprocessOutlierDetection,
        outlierIndices: dataSummary?.outliers || [],
        data_path: `${wfdir}\\data.csv`,
        wfDir: wfdir,
        target: targetColumn
      });
    });
    
    const waitStore = useWaitForComputationStore.getState();
    window.wfStore.getWfDir(workflowName).then((wfdir) => {
      waitStore.setAll(workflowName, wfdir, problemType, targetColumn, `${wfdir}\\data.csv`);
    });

    navigate('/wait-screen');
  };

  const finalizeImport = () => {
    if (!dataSummary?.issues.includes("none")) {
      setPreprocessModalOpen(true);
    }
    else {
      setStep(SetupSteps.Finish);
    }
  }

  return (
    // top most container
    <div className="flex flex-col gap-4 h-full justify-center">
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
          {/* Conditional sections */}
          <Typography.Title level={2}>Import Data</Typography.Title>
          <div className='flex-grow h-full overflow-hidden'>
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
                onNext={() => {finalizeImport()}}
                />
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
        <div className="h-full flex flex-col justify-center items-center gap-8">
            <Typography.Title level={2}>Finalize Workflow</Typography.Title>
            <div className="flex flex-row gap-4 w-full max-w-md">
            <Button block type="primary" onClick={handleBack}>Back</Button>
            <Button block type="primary" onClick={handleFinalization}>Finish</Button>
            </div>
        </div>
      )}
      <PreprocessModal issues={dataSummary?.issues || []} open={preprocessModalOpen} onClose={() => setPreprocessModalOpen(false)} onOk={handlePreprocess} />
    </div>
  );
}