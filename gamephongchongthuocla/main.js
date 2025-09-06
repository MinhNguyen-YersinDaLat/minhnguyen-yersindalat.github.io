// main.js
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

app.setAppUserModelId('com.yersin.cuocchienkhongkhoi');

// Nếu gặp lỗi nền đen khi splash trong suốt, bỏ comment dòng sau:
// app.disableHardwareAcceleration();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let splashWindow = null;

function createWindows() {
  // Splash window
  splashWindow = new BrowserWindow({
    width: 800,
    height: 520,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    resizable: false,
    show: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html')).catch(console.error);

  // Main window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    fullscreen: true, // mặc định fullscreen
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  Menu.setApplicationMenu(null); // tắt menu bar

  // Không chặn link https:// nữa → mở thẳng trong mainWindow

  mainWindow.loadFile(path.join(__dirname, 'index.html')).catch(console.error);

  // ---------------- Splash logic ----------------
  let loaded = false;
  let progress = 0;
  const startTime = Date.now();

  const ticker = setInterval(() => {
    if (progress < 90 && !loaded) {
      progress += Math.floor(Math.random() * 6) + 3;
      splashWindow.webContents.send('splash-progress', Math.min(99, progress));
    }
    if (loaded) {
      clearInterval(ticker);
      splashWindow.webContents.send('splash-progress', 100);

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 5000 - elapsed); // giữ splash ít nhất 5 giây

      setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          if (!mainWindow.isFullScreen()) mainWindow.setFullScreen(true);
        }
      }, remaining);
    }
  }, 120);

  // Đánh dấu loaded khi game load xong
  mainWindow.webContents.on('did-finish-load', () => {
    loaded = true;
  });

  // Renderer có thể gửi "app-ready"
  ipcMain.on('app-ready', () => {
    loaded = true;
  });

  // ESC → thoát fullscreen, chuyển sang maximize
  ipcMain.on('request-exit-fullscreen', () => {
    if (mainWindow && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      mainWindow.maximize();
    }
  });

  // Mở PDF cục bộ
  ipcMain.on('open-pdf', (event, filePath) => {
    const p = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
    shell.openPath(p);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// single-instance
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else if (splashWindow) {
    splashWindow.focus();
  }
});

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
  app.quit();
});
