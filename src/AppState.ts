import {create} from 'zustand';
import type { EDAData } from './backend_api/types';

export enum ModelType {
  LINEAR_REG = 0,
  NONL_REG,
  SV_REG,
  NN_REG,
  SGD_REG,
  DT_REG,
  RF_REG,
  GB_REG,
  LOGS_CLASS,
  SV_CLASS,
  NN_CLASS,
  SGD_CLASS,
  DT_CLASS,
  RF_CLASS,
  GB_CLASS,
  DNN,
}

export enum ModelState {
  TRAINED = 'trained',
  UNTRAINED = 'untrained',
  TRAINING = 'training',
  ERROR = 'error',
}

export interface UserModel {
  name: string;
  state: ModelState;
  type: ModelType;
  params: Record<string, any>; // hyperparameters
  architecture: string; // model architecture
  date: string; // date of creation
}

export interface Workflow {
  name: string;
  description: string;
  userModels: UserModel[];
  wfDir: string; // path to the workflow directory
  datafile: string; // path to the data file
  dataType: string; // type of data (e.g., CSV, JSON)
  currentModel?: UserModel; // currently selected model
}

export interface AppState {
  workflows: Workflow[]
  current?: Workflow

  // actions
  addNew: (wf: Workflow) => void
  update: (name: string, wf: Workflow) => void
  loadAll: () => Promise<void>
  save: (wf: Workflow) => Promise<void>
  removeNyName: (id: string) => Promise<void>
  setCurrent: (wf?: Workflow) => void
  setCurrentByName: (name: string) => void
  getByName: (name: string) => Workflow | undefined;
  getPCDFile: () => Promise<EDAData>;
}

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
  // load from JSON file via Electron
  loadAll: async () => {
    const all = await window.wfStore.loadAll()
    set({ workflows: all })
    // if no current selected, pick first
    if (all.length && !get().current) {
      set({ current: all[0] })
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

  getPCDFile: (): Promise<EDAData> => {
    return window.wfStore.getPCDFile(get().current!.name).then((file) => {
      if (!file) throw new Error(`PCD file not found for workflow: ${get().current!.name}`);
      return file;
    });
  }
}))