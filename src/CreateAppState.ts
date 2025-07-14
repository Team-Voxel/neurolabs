import { app } from 'electron';
import path from 'node:path';
import { Workflow, AppState } from './AppState';
import { createWorkflowInstance } from './WorkflowFactory';
import fs from 'fs/promises';
import { DatasetMetadata, EDAData, ModelMetadata } from './backend_api/types';

const APP_DATA_DIR = app.getPath('userData');
const DATA_PATH = path.join(APP_DATA_DIR, 'workflows.json');
const TEMP_DATASET_PATH = path.join(APP_DATA_DIR, 'tempdata.csv');

async function ensureStore() {
  try {
    await fs.stat(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, '[]', 'utf-8');
  }
}

export function createAppStateInstance() : Promise<AppState> {
    var appState : AppState = {
        workflows: [],
        current: undefined,
        /* currentEDA: undefined,
        currentDatasetMetadata: undefined,
        currentModelMetadata: undefined, */
        getCurrentEDA: async (): Promise<EDAData> => {
            const edapath = path.join(appState.current!.wfDir, 'edadata.json');
            const bytes = await fs.readFile(edapath, 'utf-8');
            return JSON.parse(bytes) as EDAData;
        },
        getCurrentDatasetMetadata: async (): Promise<DatasetMetadata> => {
            const datasetMetadataPath = path.join(appState.current!.wfDir, 'dataset_metadata.json');
            const bytes = await fs.readFile(datasetMetadataPath, 'utf-8');
            return JSON.parse(bytes) as DatasetMetadata;
        },
        getCurrentModelMetadata: async (): Promise<Record<string, ModelMetadata>> => {
            const modelMetadataPath = path.join(appState.current!.wfDir, 'metadata.json');
            const bytes = await fs.readFile(modelMetadataPath, 'utf-8');
            return JSON.parse(bytes) as Record<string, ModelMetadata>;
        },
        globalDataDirectory: APP_DATA_DIR,
        hasWorkflowByName: (name: string) => {
            return appState.workflows.some(wf => wf.name === name);
        },
        addNewWorkflow: async (name: string, problemType: string, target: string) => {
            const wfDirectory = path.join(APP_DATA_DIR, name);
            if (appState.hasWorkflowByName(name)) {
                console.warn(`Workflow with name ${name} already exists.`);
                return appState.getWorkflowByName(name)!;
            }
            try {
                await fs.mkdir(wfDirectory, { recursive: true });
                const wf = createWorkflowInstance(name, problemType, target, wfDirectory);
                appState.workflows.push(wf);
                return wf;
            } catch (error) {
                console.error('Error creating directory:', error);
                throw new Error(`Failed to create directory for workflow ${name}`);
            }
        },
        deleteWorkflow: async (name: string) => {
            appState.workflows = appState.workflows.filter(wf => wf.name !== name);
            await appState.saveToDiskAsync();
            await fs.rm(path.join(APP_DATA_DIR, name), { recursive: true, force: true });
            await appState.loadFromDiskAsync();
            if (appState.current && appState.current.name === name) {
                appState.current = undefined;
            }
        },
        getWorkflowByName: (name: string) => {
            return appState.workflows.find(wf => wf.name === name);
        },
        loadFromDiskAsync: async () => {
            await ensureStore();
            const raw = await fs.readFile(DATA_PATH, 'utf-8');
            let all;
            try {
                all = JSON.parse(raw);
                if (!Array.isArray(all)) {
                    throw new Error('Parsed data is not an array');
                }
            } catch (e) {
                console.error('Failed to parse workflow file:', e);
                all = [];
            }
            appState.workflows = all;
            appState.current = undefined;
        },
        saveToDiskAsync: async () => {
            await ensureStore();
            await fs.writeFile(DATA_PATH, JSON.stringify(appState.workflows, null, 2), 'utf-8');
        },
        setCurrent: async (wf: Workflow) => {
            appState.current = wf;
            
            return true;
        },
        setCurrentByName: async (name: string) => {
            const wf = appState.getWorkflowByName(name);
            if (wf) {
                appState.current = wf;
                return true;
            } else {
                console.warn(`Workflow with name ${name} not found`);
                return false;
            }
        },
        async copyDataFileToWorkflowDirectory(filepath: string, wf_name: string) {
            const wfDir = path.join(APP_DATA_DIR, wf_name);
            const dest = path.join(wfDir, 'data.csv');
            try {
                await window.fsAPI.copyFile(filepath, dest);
                console.log(`Copied data file to ${dest}`);
            } catch (err) {
                console.error(`Failed to copy data file: ${err}`);
            }
        },
        getTempDatasetPath: () => {
            return path.join(appState.globalDataDirectory, 'tempdata.csv');
        }
    };
    return Promise.resolve(appState);
}
