import { app, BrowserWindow, ipcMain } from "electron";
import fs from "fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
function createWorkflowInstance(name, problemType, target, wfDirectory) {
  const workflow = {
    name,
    problemType,
    target,
    wfDir: wfDirectory,
    datafile: path.join(wfDirectory, "data.csv"),
    edaFile: path.join(wfDirectory, "edadata.json"),
    datasetMetadataFile: path.join(wfDirectory, "dataset_metadata.json"),
    modelMetadataFile: path.join(wfDirectory, "metadata.json")
    /* async getEDAFile() {
          const data = await readFile(this.edaFile, 'utf-8');
          return JSON.parse(data);
        },
    
        async getModelMetadata() {
          const data = await readFile(this.modelMetadataFile, 'utf-8');
          return JSON.parse(data);
        },
    
        async getDatasetMetadata() {
          const data = await readFile(this.datasetMetadataFile, 'utf-8');
          return JSON.parse(data);
        } */
  };
  return workflow;
}
const APP_DATA_DIR = app.getPath("userData");
const DATA_PATH$1 = path$1.join(APP_DATA_DIR, "workflows.json");
path$1.join(APP_DATA_DIR, "tempdata.csv");
async function ensureStore$1() {
  try {
    await fs.stat(DATA_PATH$1);
  } catch {
    await fs.writeFile(DATA_PATH$1, "[]", "utf-8");
  }
}
function createAppStateInstance() {
  var appState = {
    workflows: [],
    current: void 0,
    /* currentEDA: undefined,
    currentDatasetMetadata: undefined,
    currentModelMetadata: undefined, */
    getCurrentEDA: async () => {
      const edapath = path$1.join(appState.current.wfDir, "edadata.json");
      const bytes = await fs.readFile(edapath, "utf-8");
      return JSON.parse(bytes);
    },
    getCurrentDatasetMetadata: async () => {
      const datasetMetadataPath = path$1.join(appState.current.wfDir, "dataset_metadata.json");
      const bytes = await fs.readFile(datasetMetadataPath, "utf-8");
      return JSON.parse(bytes);
    },
    getCurrentModelMetadata: async () => {
      const modelMetadataPath = path$1.join(appState.current.wfDir, "metadata.json");
      const bytes = await fs.readFile(modelMetadataPath, "utf-8");
      return JSON.parse(bytes);
    },
    globalDataDirectory: APP_DATA_DIR,
    hasWorkflowByName: (name) => {
      return appState.workflows.some((wf) => wf.name === name);
    },
    addNewWorkflow: async (name, problemType, target) => {
      const wfDirectory = path$1.join(APP_DATA_DIR, name);
      if (appState.hasWorkflowByName(name)) {
        console.warn(`Workflow with name ${name} already exists.`);
        return appState.getWorkflowByName(name);
      }
      try {
        await fs.mkdir(wfDirectory, { recursive: true });
        const wf = createWorkflowInstance(name, problemType, target, wfDirectory);
        appState.workflows.push(wf);
        return wf;
      } catch (error) {
        console.error("Error creating directory:", error);
        throw new Error(`Failed to create directory for workflow ${name}`);
      }
    },
    deleteWorkflow: async (name) => {
      appState.workflows = appState.workflows.filter((wf) => wf.name !== name);
      await appState.saveToDiskAsync();
      await fs.rm(path$1.join(APP_DATA_DIR, name), { recursive: true, force: true });
      await appState.loadFromDiskAsync();
      if (appState.current && appState.current.name === name) {
        appState.current = void 0;
      }
    },
    getWorkflowByName: (name) => {
      return appState.workflows.find((wf) => wf.name === name);
    },
    loadFromDiskAsync: async () => {
      await ensureStore$1();
      const raw = await fs.readFile(DATA_PATH$1, "utf-8");
      let all;
      try {
        all = JSON.parse(raw);
        if (!Array.isArray(all)) {
          throw new Error("Parsed data is not an array");
        }
      } catch (e) {
        console.error("Failed to parse workflow file:", e);
        all = [];
      }
      appState.workflows = all;
      appState.current = void 0;
    },
    saveToDiskAsync: async () => {
      await ensureStore$1();
      await fs.writeFile(DATA_PATH$1, JSON.stringify(appState.workflows, null, 2), "utf-8");
    },
    setCurrent: async (wf) => {
      appState.current = wf;
      return true;
    },
    setCurrentByName: async (name) => {
      const wf = appState.getWorkflowByName(name);
      if (wf) {
        appState.current = wf;
        return true;
      } else {
        console.warn(`Workflow with name ${name} not found`);
        return false;
      }
    },
    async copyDataFileToWorkflowDirectory(filepath, wf_name) {
      const wfDir = path$1.join(APP_DATA_DIR, wf_name);
      const dest = path$1.join(wfDir, "data.csv");
      try {
        await window.fsAPI.copyFile(filepath, dest);
        console.log(`Copied data file to ${dest}`);
      } catch (err) {
        console.error(`Failed to copy data file: ${err}`);
      }
    },
    getTempDatasetPath: () => {
      return path$1.join(appState.globalDataDirectory, "tempdata.csv");
    }
  };
  return Promise.resolve(appState);
}
const require2 = createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs"),
      webSecurity: false
    }
  });
  win.webContents.openDevTools({ mode: "detach" });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  app.on("before-quit", async (event) => {
    event.preventDefault();
    await global.appState.saveToDiskAsync();
    app.exit();
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const fileUrl = `file://${path$1.join(RENDERER_DIST, "index.html")}`;
    win.loadURL(fileUrl);
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(startApp).catch((err) => {
  console.error("Failed to start app:", err);
});
async function startApp() {
  try {
    await ensureStore();
    global.appState = await createAppStateInstance();
    await global.appState.loadFromDiskAsync();
  } catch (err) {
    console.error("Failed to load workflows:", err);
  }
  createWindow();
}
ipcMain.handle("read-file", async (_e, filePath) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    return Promise.reject("File not found: " + filePath);
  }
  return await fs.readFile(filePath, "utf-8");
});
ipcMain.handle("write-file", async (_e, filePath, content) => {
  const dirPath = path$1.dirname(filePath);
  try {
    await fs.access(dirPath);
  } catch (error) {
    throw new Error(`Directory not found: ${dirPath}`);
  }
  return await fs.writeFile(filePath, content, "utf-8");
});
ipcMain.handle("create-dir", async (_e, dirPath) => {
  return await fs.mkdir(dirPath, { recursive: true });
});
ipcMain.handle("copy-file", async (_e, src, dest) => {
  return await fs.copyFile(src, dest);
});
ipcMain.handle(
  "delete-file",
  async (_e, filePath) => {
    return await fs.unlink(filePath);
  }
);
ipcMain.handle("join-path", async (_e, ...paths) => {
  return path$1.join(...paths);
});
ipcMain.handle(
  "resolve-path",
  async (_e, filePath) => {
    return path$1.resolve(filePath);
  }
);
ipcMain.handle("get-app-root", async () => {
  return process.env.APP_ROOT;
});
ipcMain.handle("get-public-path", async () => {
  return process.env.VITE_PUBLIC;
});
ipcMain.handle("get-app-path", async () => {
  return app.getAppPath();
});
ipcMain.handle("get-extension", async (_e, file) => {
  const ext = path$1.extname(file);
  return ext;
});
ipcMain.handle("get-file-name", async (_e, file) => {
  const name = path$1.basename(file, path$1.extname(file));
  return name;
});
ipcMain.handle("dialog:openFile", async (event) => {
  const { dialog } = require2("electron");
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Data Files", extensions: ["csv", "xlsx", "xls", "json", "txt"] }
    ]
  });
  return result.filePaths;
});
const DATA_PATH = path$1.join(app.getPath("userData"), "workflows.json");
const TEMP_DATASET_PATH = path$1.join(app.getPath("userData"), "tempdata.csv");
ipcMain.handle("get-temp-dataset-path", async () => {
  try {
    await fs.stat(TEMP_DATASET_PATH);
  } catch {
    await fs.writeFile(TEMP_DATASET_PATH, "", "utf-8");
  }
  return TEMP_DATASET_PATH;
});
async function ensureStore() {
  try {
    await fs.stat(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]", "utf-8");
  }
}
ipcMain.handle("wf-load-all", async () => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
});
ipcMain.handle("wf-save-all", async (_e, wfs) => {
  await ensureStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(wfs, null, 2), "utf-8");
});
ipcMain.handle("wf-save-one", async (_e, wf) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const idx = all.findIndex((x) => x.name === wf.name);
  if (idx >= 0) all[idx] = wf;
  else all.push(wf);
  await fs.writeFile(DATA_PATH, JSON.stringify(all, null, 2), "utf-8");
  return wf;
});
ipcMain.handle("wf-delete-one", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const filtered = all.filter((x) => x.name !== name);
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  const wfDir = path$1.join(app.getPath("userData"), name);
  try {
    await fs.rm(wfDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Error deleting workflow directory:", error);
  }
  return filtered;
});
ipcMain.handle("wf-get-workflow-dir", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === name);
  if (wf) {
    return path$1.join(app.getPath("userData"), wf.name);
  } else {
    const newDir = path$1.join(app.getPath("userData"), name);
    try {
      await fs.mkdir(newDir, { recursive: true });
      return newDir;
    } catch (error) {
      console.error("Error creating directory:", error);
      throw new Error(`Failed to create directory for workflow ${name}`);
    }
  }
});
ipcMain.handle("wf-get-pcd-file", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === name);
  if (wf) {
    const pcdfile_path = path$1.join(app.getPath("userData"), wf.name, "edadata.json");
    const raw_bytes = await fs.readFile(pcdfile_path, "utf-8");
    const data = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${name} not found`);
  }
});
ipcMain.handle("wf-get-model-metadata", async (_e, wf_name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === wf_name);
  if (wf) {
    const metadata_path = path$1.join(app.getPath("userData"), wf.name, "metadata.json");
    const raw_bytes = await fs.readFile(metadata_path, "utf-8");
    const data = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${wf_name} not found`);
  }
});
ipcMain.handle("wf-get-dataset-metadata", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === name);
  if (wf) {
    const metadata_path = path$1.join(app.getPath("userData"), wf.name, "dataset_metadata.json");
    const raw_bytes = await fs.readFile(metadata_path, "utf-8");
    const data = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${name} not found`);
  }
});
const childWindows = /* @__PURE__ */ new Set();
function createCustomWindow(options) {
  const win2 = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win2.loadURL(`${VITE_DEV_SERVER_URL}#/child`);
  } else {
    const fileUrl = `file://${path$1.join(RENDERER_DIST, "index.html")}#/child`;
    win2.loadURL(fileUrl);
  }
  win2.webContents.on("did-finish-load", () => {
    win2.webContents.send("child-window:init", options);
  });
  childWindows.add(win2);
  win2.on("closed", () => childWindows.delete(win2));
  win2.webContents.openDevTools({ mode: "detach" });
  return win2;
}
ipcMain.handle("open-child-window", (_evt, options) => {
  return createCustomWindow(options);
});
ipcMain.handle("get-app-state", async (_evt) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const { workflows, current } = global.appState;
  return { workflows, current };
});
ipcMain.handle("get-data-path", async (_evt) => {
  return DATA_PATH;
});
ipcMain.handle("get-copy-file-to-wfdir", async (_evt, src, wfName) => {
  const wfDir = path$1.join(app.getPath("userData"), wfName);
  try {
    await fs.mkdir(wfDir, { recursive: true });
  } catch (error) {
    console.error("Error creating workflow directory:", error);
    throw new Error(`Failed to create directory for workflow ${wfName}`);
  }
  const dest = path$1.join(app.getPath("userData"), wfName, "data.csv");
  return await fs.copyFile(src, dest);
});
ipcMain.handle("get-eda-data", async (_evt) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const data = global.appState.getCurrentEDA();
  return data;
});
ipcMain.handle("get-dataset-metadata", async (_evt) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const data = global.appState.getCurrentDatasetMetadata();
  return data;
});
ipcMain.handle("get-model-metadata", async (_evt) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const data = global.appState.getCurrentModelMetadata();
  return data;
});
ipcMain.handle("set-current-workflow", async (_evt, name) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const success = await global.appState.setCurrentByName(name);
  return success;
});
ipcMain.handle("add-new-workflow-and-set", async (_evt, name, problemType, target) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  const wf = await global.appState.addNewWorkflow(name, problemType, target);
  await global.appState.setCurrent(wf);
  await global.appState.saveToDiskAsync();
  console.log("New workflow added:", wf);
  return wf;
});
ipcMain.handle("delete-workflow", async (_evt, name) => {
  if (!global.appState) {
    throw new Error("App state is not initialized");
  }
  global.appState.deleteWorkflow(name);
  return { success: true };
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
