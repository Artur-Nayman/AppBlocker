import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import Store from "electron-store";
import { startBlocking, stopBlocking } from "./blocker.js";

const store = new Store();

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(app.getAppPath(), "electron/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(app.getAppPath(), "dist/index.html"));
  } else {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  }
}

function notifyRenderer(isBlocking, data = {}) {
  if (win) {
    win.webContents.send("blocking:state", { isBlocking, ...data });
  }
}

app.whenReady().then(createWindow);

// IPC handlers for managing the stored program list
ipcMain.handle("programs:get", () => store.get("programs", []));
ipcMain.handle("programs:set", (e, programs) => store.set("programs", programs));
ipcMain.handle("programs:browse", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Executables", extensions: ["exe"] }],
  });
  if (canceled) return [];
  return filePaths.map(p => path.basename(p));
});

ipcMain.handle("blocker:start", (e, data) => {
  startBlocking({
    ...data,
    onStop: () => notifyRenderer(false)
  });
  notifyRenderer(true, { duration: data.durationMs / 1000, programs: data.processNames });
});

ipcMain.handle("blocker:stop", (e, data) => {
  const result = stopBlocking(data);
  if (result.success) {
    notifyRenderer(false);
  }
  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
