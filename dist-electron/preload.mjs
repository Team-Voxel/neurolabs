"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("fsAPI", {
  readFile: (path) => electron.ipcRenderer.invoke("read-file", path),
  writeFile: (path, content) => electron.ipcRenderer.invoke("write-file", path, content),
  createDir: (path) => electron.ipcRenderer.invoke("create-dir", path),
  copyFile: (src, dest) => electron.ipcRenderer.invoke("copy-file", src, dest),
  deleteFile: (path) => electron.ipcRenderer.invoke("delete-file", path),
  joinPath: (...paths) => electron.ipcRenderer.invoke("join-path", ...paths),
  resolvePath: (path) => electron.ipcRenderer.invoke("resolve-path", path),
  getAppRoot: () => electron.ipcRenderer.invoke("get-app-root"),
  getPublicPath: () => electron.ipcRenderer.invoke("get-public-path"),
  getAppPath: () => electron.ipcRenderer.invoke("get-app-path"),
  getExtension: (file) => electron.ipcRenderer.invoke("get-extension", file),
  getFileName: (file) => electron.ipcRenderer.invoke("get-file-name", file),
  openFile: () => electron.ipcRenderer.invoke("dialog:openFile"),
  getTempDatasetPath: () => electron.ipcRenderer.invoke("get-temp-dataset-path")
});
electron.contextBridge.exposeInMainWorld("wfStore", {
  loadAll: () => electron.ipcRenderer.invoke("wf-load-all"),
  saveOne: (wf) => electron.ipcRenderer.invoke("wf-save-one", wf),
  deleteOne: (id) => electron.ipcRenderer.invoke("wf-delete-one", id),
  loadModels: (name) => electron.ipcRenderer.invoke("wf-get-models", name),
  getWfDir: (name) => electron.ipcRenderer.invoke("wf-get-workflow-dir", name)
});
