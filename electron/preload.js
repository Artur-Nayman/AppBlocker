const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Blocker controls
  startBlock: (config) => ipcRenderer.invoke("blocker:start", config),
  stopBlock: (pin) => ipcRenderer.invoke("blocker:stop", { pin }),
  
  // Program list management
  getPrograms: () => ipcRenderer.invoke("programs:get"),
  setPrograms: (programs) => ipcRenderer.invoke("programs:set", programs),
  browseForPrograms: () => ipcRenderer.invoke("programs:browse"),

  // State listeners
  onBlockingState: (callback) => ipcRenderer.on("blocking:state", callback),
  removeBlockingStateListener: (callback) => ipcRenderer.removeListener("blocking:state", callback)
});
