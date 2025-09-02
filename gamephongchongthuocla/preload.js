// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  quitApp: () => ipcRenderer.send('quit-app'),
  // nếu cần lắng nghe event từ main
  onMainMessage: (cb) => ipcRenderer.on('some-main-event', cb)
});
