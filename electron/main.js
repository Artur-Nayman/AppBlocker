import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { startBlocking, stopBlocking } from "./blocker.js";

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
