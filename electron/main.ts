import { app, BrowserWindow, ipcMain} from 'electron'
import fs from 'fs/promises';
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { exit } from 'node:process'
import { Workflow, AppState } from '../src/AppState'
import { DatasetMetadata, EDAData, ModelMetadata } from '../src/backend_api/types';
import { createAppStateInstance } from '../src/CreateAppState';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.openDevTools({ mode: 'detach' })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  app.on('before-quit', async (event) => {
    event.preventDefault(); // optional, gives time to save
  
    // Save all workflows before exiting
    await global.appState.saveToDiskAsync();
    // Now exit the app
    app.exit();
  });

  if (VITE_DEV_SERVER_URL) {
    // Dev
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // Prod: load the built index.html and add the hash fragment
    const fileUrl = `file://${path.join(RENDERER_DIST, 'index.html')}`;
    win.loadURL(fileUrl);
  }
  //const { contextBridge, ipcRenderer } = require('electron');

/* contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  exit: () => exit(0),
}); */
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(startApp).catch(err => {
  console.error('Failed to start app:', err);
});

async function startApp() {
  try {
    await ensureStore();
    global.appState = await createAppStateInstance();
    await global.appState.loadFromDiskAsync();
  } catch (err) {
    console.error('Failed to load workflows:', err);
  }

  createWindow();
}

ipcMain.handle('read-file', async (_e, filePath) => {
  return await fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('write-file', async (_e, filePath, content) => {
  return await fs.writeFile(filePath, content, 'utf-8');
});

ipcMain.handle('create-dir', async (_e, dirPath) => {
  return await fs.mkdir(dirPath, { recursive: true });
});

ipcMain.handle('copy-file', async (_e, src, dest) => {
  return await fs.copyFile(src, dest);
});

ipcMain.handle('delete-file', async (_e, filePath) => {
  return await fs.unlink(filePath);
}
);

ipcMain.handle('join-path', async (_e, ...paths) => {
  return path.join(...paths);
});

ipcMain.handle('resolve-path', async (_e, filePath) => {
  return path.resolve(filePath);
}
);

ipcMain.handle('get-app-root', async () => {
  return process.env.APP_ROOT;
});

ipcMain.handle('get-public-path', async () => {
  return process.env.VITE_PUBLIC;
});

ipcMain.handle('get-app-path', async () => {
  return app.getAppPath();
});

ipcMain.handle('get-extension', async (_e, file) => {
  const ext = path.extname(file);
  return ext;
});

ipcMain.handle('get-file-name', async (_e, file) => {
  const name = path.basename(file, path.extname(file));
  return name;
});

ipcMain.handle('dialog:openFile', async (event) => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Data Files', extensions: ['csv','xlsx', 'xls', 'json', 'txt'] },
    ]
  });
  return result.filePaths;
});

const DATA_PATH = path.join(app.getPath('userData'), 'workflows.json');
const TEMP_DATASET_PATH = path.join(app.getPath('userData'), 'tempdata.csv');

// Get temporary dataset path
ipcMain.handle('get-temp-dataset-path', async () => {
  // Ensure the temp dataset file exists
  try {
    await fs.stat(TEMP_DATASET_PATH);
  } catch {
    await fs.writeFile(TEMP_DATASET_PATH, '', 'utf-8');
  }
  return TEMP_DATASET_PATH;
});

// ensure the file exists
async function ensureStore() {
  try {
    await fs.stat(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, '[]', 'utf-8');
  }
}

// load all workflows
ipcMain.handle('wf-load-all', async () => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw) as Workflow[];
});

// save all workflows
ipcMain.handle('wf-save-all', async (_e, wfs: Workflow[]) => {
  await ensureStore();
  await fs.writeFile(DATA_PATH, JSON.stringify(wfs, null, 2), 'utf-8');
});

// save or update one workflow
ipcMain.handle('wf-save-one', async (_e, wf: Workflow) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const idx = all.findIndex(x => x.name === wf.name);
  if (idx >= 0) all[idx] = wf;
  else all.push(wf);
  await fs.writeFile(DATA_PATH, JSON.stringify(all, null, 2), 'utf-8');
  return wf;
});

// delete one by name
ipcMain.handle('wf-delete-one', async (_e, name: string) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const filtered = all.filter(x => x.name !== name);
  await fs.writeFile(DATA_PATH, JSON.stringify(filtered, null, 2), 'utf-8');

  // Remove the workflow directory and its contents
  const wfDir = path.join(app.getPath('userData'), name);
  try {
    await fs.rm(wfDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error deleting workflow directory:', error);
  }
  return filtered;
});


ipcMain.handle('wf-get-workflow-dir', async (_e, name: string) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const wf = all.find(x => x.name === name);
  if (wf) {
    return path.join(app.getPath('userData'), wf.name);
  } else {
    // Create a new workflow directory if it doesn't exist
    const newDir = path.join(app.getPath('userData'), name);
    try {
      await fs.mkdir(newDir, { recursive: true });
      return newDir;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw new Error(`Failed to create directory for workflow ${name}`);
    }
  }
});


ipcMain.handle('wf-get-pcd-file', async (_e, name: string) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const wf = all.find(x => x.name === name);
  if (wf) {
    // read the EDA file from the workflow directory
    const pcdfile_path = path.join(app.getPath('userData'), wf.name, 'edadata.json');
    const raw_bytes = await fs.readFile(pcdfile_path, 'utf-8');
    const data : EDAData = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${name} not found`);
  }
});

ipcMain.handle('wf-get-model-metadata', async (_e, wf_name: string) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const wf = all.find(x => x.name === wf_name);
  if (wf) {
    const metadata_path = path.join(app.getPath('userData'), wf.name, 'model_metadata.json');
    const raw_bytes = await fs.readFile(metadata_path, 'utf-8');
    const data : Record<string, ModelMetadata> = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${wf_name} not found`);
  }
});

ipcMain.handle('wf-get-dataset-metadata', async (_e, name: string) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const all: Workflow[] = JSON.parse(raw);
  const wf = all.find(x => x.name === name);
  if (wf) {
    const metadata_path = path.join(app.getPath('userData'), wf.name, 'dataset_metadata.json');
    const raw_bytes = await fs.readFile(metadata_path, 'utf-8');
    const data : DatasetMetadata = JSON.parse(raw_bytes);
    return data;
  } else {
    throw new Error(`Workflow ${name} not found`);
  }
});


  const childWindows = new Set<BrowserWindow>();

function createCustomWindow(options: { component: string; props: any }) {
  const win = new BrowserWindow({
    width: 500, height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Point all custom windows to the same entry (e.g. "#child")
  /* const entryUrl = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}/child`
    : `file://${path.join(__dirname, '../dist/index.html')}#child`;

  win.loadURL(entryUrl); */
  
  if (VITE_DEV_SERVER_URL) {
    // Dev
    win.loadURL(`${VITE_DEV_SERVER_URL}#/child`);
  } else {
    // Prod: load the built index.html and add the hash fragment
    const fileUrl = `file://${path.join(RENDERER_DIST, 'index.html')}#/child`;
    win.loadURL(fileUrl);
  }

  win.webContents.on('did-finish-load', () => {
    // Send both the component key and its props
    win.webContents.send('child-window:init', options);
  });

  childWindows.add(win);
  win.on('closed', () => childWindows.delete(win));

  // Open developer console for debugging
  win.webContents.openDevTools({ mode: 'detach' });

  return win;
}

ipcMain.handle('open-child-window', (_evt, options) => {
  return createCustomWindow(options);
});


ipcMain.handle('get-app-state', () => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const { workflows, current } = global.appState;
  return { workflows, current };
});

ipcMain.handle('get-eda-data', async (_evt) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const data = global.appState.currentEDA;
  return data;
});

ipcMain.handle('get-dataset-metadata', async (_evt) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const data = global.appState.currentDatasetMetadata;
  return data;
});

ipcMain.handle('get-model-metadata', async (_evt) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const data = global.appState.currentModelMetadata;
  return data;
});

ipcMain.handle('set-current-workflow', async (_evt, name: string) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const success = await global.appState.setCurrentByName(name);
  return success;
});

ipcMain.handle('add-new-workflow-and-set', async (_evt, name: string, problemType: string, target: string) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  const wf = await global.appState.addNewWorkflow(name, problemType, target);
  await global.appState.setCurrent(wf);

  console.log('New workflow added:', wf);
  return wf;
});

ipcMain.handle('delete-workflow', async (_evt, name: string) => {
  if (!global.appState) {
    throw new Error('App state is not initialized');
  }
  global.appState.deleteWorkflow(name);
  console.log(`Workflow ${name} deleted`);
  return { success: true };
});