// main.js
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

const MIN_SPLASH_MS = 2000; // splash tối thiểu 2s

let mainWin = null;
let splash = null;
let splashShownAt = 0;

// --- Single instance lock (chống mở nhiều cửa sổ) ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  // nếu user mở lần 2 => focus cửa sổ cũ
  if (mainWin) {
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.focus();
  }
});

// tạo splash
function createSplash() {
  splash = new BrowserWindow({
    width: 500,
    height: 340,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,    // cho phép splash dùng ipcRenderer trực tiếp
      contextIsolation: false
    }
  });
  splash.loadFile(path.join(__dirname, 'splash.html'));
  splashShownAt = Date.now();
}

// tạo main window (ẩn lúc đầu)
function createMainWindow() {
  mainWin = new BrowserWindow({
    show: false,
    fullscreen: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !app.isPackaged // devTools bật khi dev
    }
  });

  // load file renderer đã obfuscate/copy vào dist/
  mainWin.loadFile(path.join(__dirname, 'dist', 'index.html'));
  mainWin.setMenuBarVisibility(false);

  // Khi renderer load xong: đảm bảo splash giữ tối thiểu MIN_SPLASH_MS, rồi fade out
  mainWin.webContents.once('did-finish-load', () => {
    const elapsed = Date.now() - splashShownAt;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => {
      if (splash && !splash.isDestroyed()) {
        splash.webContents.send('fade-out'); // gửi cho splash fade animation
        // đóng splash sau khi animation xong
        setTimeout(() => {
          try { splash.close(); } catch (e) {}
          splash = null;
          mainWin.show();
        }, 800); // khớp thời gian fade-out trong splash.html
      } else {
        mainWin.show();
      }
    }, wait);
  });

  // ESC thoát fullscreen => maximize (không thoát app)
  globalShortcut.register('Esc', () => {
    if (mainWin && mainWin.isFullScreen()) {
      mainWin.setFullScreen(false);
      mainWin.maximize();
    }
  });

  // nếu window bị closed
  mainWin.on('closed', () => {
    mainWin = null;
  });
}

// cho phép renderer (preload) yêu cầu thoát app
ipcMain.on('quit-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createSplash();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplash();
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
