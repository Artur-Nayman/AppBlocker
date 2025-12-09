const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Blocker controls
  startBlock: (config) => ipcRenderer.invoke("blocker:start", config),
  stopBlock: (pin) => ipcRenderer.invoke("blocker:stop", { pin }),
  
  // Program list management
  getPrograms: () => ipcRenderer.invoke("programs:get"),
  setPrograms: (programs) => ipcRenderer.invoke("programs:set", programs),
  browseForPrograms: () => ipcRenderer.invoke("programs:browse"),

  // Settings
  getMinimizeToTray: () => ipcRenderer.invoke('settings:get-minimize-to-tray'),
  setMinimizeToTray: (value) => ipcRenderer.invoke('settings:set-minimize-to-tray', value),
  getStartOnLogin: () => ipcRenderer.invoke('settings:get-start-on-login'),
  setStartOnLogin: (value) => ipcRenderer.invoke('settings:set-start-on-login', value),
  getStartMinimized: () => ipcRenderer.invoke('settings:get-start-minimized'),
  setStartMinimized: (value) => ipcRenderer.invoke('settings:set-start-minimized', value),

  // State listeners
  onBlockingState: (callback) => ipcRenderer.on("blocking:state", callback),
  removeBlockingStateListener: (callback) => ipcRenderer.removeListener("blocking:state", callback)
});
