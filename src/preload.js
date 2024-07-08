const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getWifiStatus: () => ipcRenderer.invoke('get-wifi-status'),
});
