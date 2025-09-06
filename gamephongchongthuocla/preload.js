// preload.js  — overwrite this file
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendExitFullscreen: () => ipcRenderer.send('request-exit-fullscreen'),
  notifyAppReady: () => ipcRenderer.send('app-ready'),
  onSplashProgress: (cb) => {
    ipcRenderer.on('splash-progress', (event, v) => cb(v));
  },
  openPDF: (filePath) => ipcRenderer.send('open-pdf', filePath)
});

// Auto-catch ESC at renderer level (works in any loaded page with this preload)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ipcRenderer.send('request-exit-fullscreen');
  }
});
