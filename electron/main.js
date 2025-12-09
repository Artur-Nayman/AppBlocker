import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } from "electron";
import path from "node:path";
import Store from "electron-store";
import { startBlocking, stopBlocking } from "./blocker.js";

const store = new Store();

let win;
let tray = null;

// This function applies the auto-launch settings based on stored values.
function applyLoginSettings() {
  const startOnLogin = store.get('settings-start-on-login', false);
  const startMinimized = store.get('settings-start-minimized', false);

  app.setLoginItemSettings({
    openAtLogin: startOnLogin,
    // Pass a command-line argument to indicate a hidden start ONLY if both settings are enabled.
    args: (startOnLogin && startMinimized) ? ['--hidden'] : []
  });
}

function createWindow() {
  // Check if the app was launched with the '--hidden' argument.
  const startMinimized = process.argv.includes('--hidden');

  win = new BrowserWindow({
    width: 900,
    height: 700,
    show: !startMinimized, // Don't show the window if starting minimized.
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
    if (!startMinimized) {
      win.webContents.openDevTools();
    }
  }

  win.on('close', (event) => {
    if (store.get('settings-minimize-to-tray', false) && !app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'electron/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => win.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('App Blocker');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win.show());
}

function notifyRenderer(isBlocking, data = {}) {
  if (win) {
    win.webContents.send("blocking:state", { isBlocking, ...data });
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

// IPC handlers for settings
ipcMain.handle('settings:get-minimize-to-tray', () => store.get('settings-minimize-to-tray', false));
ipcMain.handle('settings:set-minimize-to-tray', (e, value) => store.set('settings-minimize-to-tray', value));

ipcMain.handle('settings:get-start-on-login', () => store.get('settings-start-on-login', false));
ipcMain.handle('settings:set-start-on-login', (e, value) => {
  store.set('settings-start-on-login', value);
  applyLoginSettings(); // Re-apply settings whenever it changes
});

ipcMain.handle('settings:get-start-minimized', () => store.get('settings-start-minimized', false));
ipcMain.handle('settings:set-start-minimized', (e, value) => {
  store.set('settings-start-minimized', value);
  applyLoginSettings(); // Re-apply settings whenever it changes
});


// Other IPC handlers...
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
    // Do nothing, the app is in the tray
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
