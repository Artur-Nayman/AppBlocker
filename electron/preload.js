const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  startBlock: (config) => ipcRenderer.invoke("blocker:start", config),
  stopBlock: (pin) => ipcRenderer.invoke("blocker:stop", { pin }), // Pass PIN in an object
  
  // Listener for state changes from main process
  onBlockingState: (callback) => ipcRenderer.on("blocking:state", callback),
  removeBlockingStateListener: (callback) => ipcRenderer.removeListener("blocking:state", callback)
});
