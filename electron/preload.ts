import { ipcRenderer, contextBridge } from 'electron'
import { Workflow } from '../src/AppState'
import { DatasetMetadata, EDAData, ModelMetadataObject } from '../src/backend_api/types'


contextBridge.exposeInMainWorld('electronAPI', {
  openChildWindow: (options) => ipcRenderer.invoke('open-child-window', options),
  onChildInit: (cb) => ipcRenderer.on('child-window:init', (_e, data) => cb(data)),
});

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

})


contextBridge.exposeInMainWorld('fsAPI', {
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) => ipcRenderer.invoke('write-file', path, content),
  createDir: (path: string) => ipcRenderer.invoke('create-dir', path),
  copyFile: (src: string, dest: string) => ipcRenderer.invoke('copy-file', src, dest),
  deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
  joinPath: (...paths: string[]) => ipcRenderer.invoke('join-path', ...paths),
  resolvePath: (path: string) => ipcRenderer.invoke('resolve-path', path),
  getAppRoot: () => ipcRenderer.invoke('get-app-root'),
  getPublicPath: () => ipcRenderer.invoke('get-public-path'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getExtension: (file: string) => ipcRenderer.invoke('get-extension', file),
  getFileName: (file: string) => ipcRenderer.invoke('get-file-name', file),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  getTempDatasetPath: () => ipcRenderer.invoke('get-temp-dataset-path'),
});


contextBridge.exposeInMainWorld('wfStore', {
  loadAll: (): Promise<Workflow[]>       => ipcRenderer.invoke('wf-load-all'),
  saveOne: (wf: Workflow): Promise<Workflow> => ipcRenderer.invoke('wf-save-one', wf),
  deleteOne: (id: string): Promise<Workflow[]> => ipcRenderer.invoke('wf-delete-one', id),
  getWfDir: (name: string): Promise<string> => ipcRenderer.invoke('wf-get-workflow-dir', name),
  getPCDFile: (name: string): Promise<EDAData> => ipcRenderer.invoke('wf-get-pcd-file', name),
  getModelMetadata: (name: string): Promise<ModelMetadataObject> => ipcRenderer.invoke('wf-get-model-metadata', name),
  getDatasetMetadata: (name: string): Promise<DatasetMetadata> => ipcRenderer.invoke('wf-get-dataset-metadata', name),
});