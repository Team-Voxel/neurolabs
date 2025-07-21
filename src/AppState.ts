import type { EDAData, ModelMetadata, DatasetMetadata } from './backend_api/types';

export enum ModelState {
  TRAINED = 'trained',
  UNTRAINED = 'untrained',
  TRAINING = 'training',
  ERROR = 'error',
}


export interface Workflow {
  name: string;
  problemType: string;
  target: string;
  wfDir: string; // path to the workflow directory
  datafile: string; // path to the data file
  edaFile: string; // path to the EDA file
  datasetMetadataFile: string; // metadata about the dataset
  modelMetadataFile: string; // metadata about the models

/*   getEDAFile: () => Promise<EDAData>;
  getModelMetadata: () => Promise<ModelMetadataObject>;
  getDatasetMetadata: () => Promise<DatasetMetadata>; */
}

export interface AppState {
  workflows: Workflow[];
  current?: Workflow;
  getCurrentEDA(): Promise<EDAData>;
  getCurrentDatasetMetadata(): Promise<DatasetMetadata>;
  getCurrentModelMetadata(): Promise<Record<string, ModelMetadata>>;

  globalDataDirectory: string;

  // actions
  hasWorkflowByName: (name: string) => boolean;
  addNewWorkflow: (name: string, problemType: string, target: string) => Promise<Workflow>
  deleteWorkflow: (name: string) => void
  getWorkflowByName: (name: string) => Workflow | undefined;
  loadFromDiskAsync: () => Promise<void>
  saveToDiskAsync: () => Promise<void>
  setCurrent: (wf: Workflow) => Promise<boolean>;
  setCurrentByName: (name: string) => Promise<boolean>;

  copyDataFileToWorkflowDirectory: (file: string, wf_name: string) => Promise<void>;
  getTempDatasetPath: () => string;
}
/* 
export const useWorkflowStore = create<AppState>((set, get) => ({
  workflows: [],
  current: undefined,

  addNew: (wf) => {
    set((state) => ({
      workflows: [...state.workflows, wf],
    }))
    // save to JSON file via Electron
    window.wfStore.saveOne(wf).then(() => {
      // re-load everything so we have fresh list
      get().loadAll()
    })
  },
  update: (name, wf) => {
    set((state) => ({
      workflows: state.workflows.map((w) => (w.name === name ? wf : w)),
    }))
    // save to JSON file via Electron
    window.wfStore.saveOne(wf).then(() => {
      // re-load everything so we have fresh list
      get().loadAll()
    })
  },
    loadAll: async () => {
      const all = await window.wfStore.loadAll();
      set({ workflows: all });
  
      const current = get().current;
      if (!current && all.length > 0) {
        set({ current: all[0] });
      }
    },

  // save or update a workflow
  save: async (wf) => {
    await window.wfStore.saveOne(wf)
    // re-load everything so we have fresh list
    await get().loadAll()
    // if it’s the one we just saved, re-set current
    set({ current: wf })
  },

  // delete by name
  removeNyName: async (name) => {
    await window.wfStore.deleteOne(name)
    // reload workflows
    const all = await window.wfStore.loadAll()
    set({ workflows: all, current: all[0] })
  },

  // just change current in memory
  setCurrent: (wf) => set({ current: wf }),

  setCurrentByName: (name) => {
    const wf = get().workflows.find((w) => w.name === name)
    if (wf) {
      set({ current: wf })
    }
  },

  getByName: (name) => {
    return get().workflows.find((w) => w.name === name);
  },

  getEDAFile: (): Promise<EDAData> => {
    return window.wfStore.getPCDFile(get().current!.name).then((file) => {
      if (!file) throw new Error(`EDA file not found for workflow: ${get().current!.name}`);
      return file;
    });
  },

  getModelMetadata: (name: string): Promise<ModelMetadataObject> => {
    return window.wfStore.getModelMetadata(name).then((metadata) => {
      return metadata;
    });
  }
})) */