import { app, BrowserWindow, ipcMain } from "electron";
import fs from "fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require2 = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.openDevTools({ mode: "detach" });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const fileUrl = `file://${path.join(RENDERER_DIST, "index.html")}`;
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
app.whenReady().then(createWindow);
ipcMain.handle("read-file", async (_e, filePath) => {
  return await fs.readFile(filePath, "utf-8");
});
ipcMain.handle("write-file", async (_e, filePath, content) => {
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
  return path.join(...paths);
});
ipcMain.handle(
  "resolve-path",
  async (_e, filePath) => {
    return path.resolve(filePath);
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
  const ext = path.extname(file);
  return ext;
});
ipcMain.handle("get-file-name", async (_e, file) => {
  const name = path.basename(file, path.extname(file));
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
const DATA_PATH = path.join(app.getPath("userData"), "workflows.json");
const TEMP_DATASET_PATH = path.join(app.getPath("userData"), "tempdata.csv");
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
  const wfDir = path.join(app.getPath("userData"), name);
  try {
    await fs.rm(wfDir, { recursive: true, force: true });
  } catch (error) {
    console.error("Error deleting workflow directory:", error);
  }
  return filtered;
});
ipcMain.handle("wf-get-models", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === name);
  if (wf) {
    return wf.userModels;
  } else {
    throw new Error(`Workflow ${name} not found`);
  }
});
ipcMain.handle("wf-get-workflow-dir", async (_e, name) => {
  await ensureStore();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const all = JSON.parse(raw);
  const wf = all.find((x) => x.name === name);
  if (wf) {
    return path.join(app.getPath("userData"), wf.name);
  } else {
    const newDir = path.join(app.getPath("userData"), name);
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
    const pcdfile_path = path.join(app.getPath("userData"), wf.name, "edadata.json");
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
    const metadata_path = path.join(app.getPath("userData"), wf.name, "model_metadata.json");
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
    const metadata_path = path.join(app.getPath("userData"), wf.name, "dataset_metadata.json");
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
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win2.loadURL(`${VITE_DEV_SERVER_URL}#/child`);
  } else {
    const fileUrl = `file://${path.join(RENDERER_DIST, "index.html")}#/child`;
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
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
