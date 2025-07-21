import { Workflow, AppState } from './AppState';
import { EDAData, DatasetMetadata, ModelMetadata } from './backend_api/types';
import { createWorkflowInstance } from './WorkflowFactory';
import { app } from 'electron';
import path from 'node:path'

declare global {
  var appState : AppState;

  interface Window {
    electronAPI: {
      /**
       * Opens a new child window rendering the specified React component with given props.
       * @param options.component - The key of the component to render (must match a key in your componentMap).
       * @param options.props - Props to pass into the rendered component.
       */
      openChildWindow(options: { component: string; props: any }): Promise<void>;

      /**
       * Register a callback to receive initialization data when the child window finishes loading.
       * @param cb - Function invoked with the data object containing `component` and `props`.
       */
      onChildInit(cb: (data: { component: string; props: any }) => void): void;
    };
    wfStore: {
      loadAll(): Promise<Workflow[]>;
      saveAll(wfs: Workflow[]): Promise<void>;
      saveOne(wf: Workflow): Promise<Workflow>;
      deleteOne(name: string): Promise<Workflow[]>;
      getModels(name: string): Promise<UserModel[]>;
      getWfDir: (name: string) => Promise<string>;
      getPCDFile: (name: string) => Promise<EDAData>;
      getModelMetadata: (name: string) => Promise<Record<string,ModelMetadata>>;
      getDatasetMetadata: (name: string) => Promise<DatasetMetadata>;
    };
    fsAPI: {
      readFile: (path: string) => Promise<string>;
      writeFile: (path: string, content: string) => Promise<void>;
      createDir: (path: string) => Promise<void>;
      copyFile: (src: string, dest: string) => Promise<void>;
      joinPath: (...paths: string[]) => Promise<string>;
      resolvePath: (path: string) => Promise<string>;
      getExtension: (file: string) => Promise<string>;
      getTempDatasetPath: () => Promise<string>;
    };
    stateAPI: {
      getAppState: () => Promise<{workflows: Workflow[], current: Workflow | undefined}>;
      getDataPath: () => Promise<string>;
      copyDataFileToWFDir: (src: string, wfName: string) => Promise<void>;
      // Add fetch methods for EDA, Dataset Metadata, Model Metadata
      getEDAData: () => Promise<EDAData>;
      getDatasetMetadata: () => Promise<DatasetMetadata>;
      getModelMetadata: () => Promise<Record<string, ModelMetadata>>;
      // Add methods to manipulate workflows
      setCurrentWorkflow: (name: string) => Promise<void>;
      addNewWorkflowAndSet: (name: string, problemType: string, target: string) => Promise<Workflow>;
      deleteWorkflow: (name: string) => Promise<void>;
    }
  }
} 
export {};