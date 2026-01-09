import { app, BrowserWindow, ipcMain, safeStorage } from 'electron';
import path from 'path';
import Store from 'electron-store';

// Suppress Linux-specific warnings
if (process.platform === 'linux') {
  // Disable hardware acceleration to avoid GPU warnings
  app.disableHardwareAcceleration();
  
  // Suppress IBUS warnings
  process.env['IBUS_DISABLE_SNOOPER'] = '1';
  
  // Suppress other warnings
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
}

// Suppress security warnings in development
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'SkypeAlternative',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Secure storage IPC handlers
ipcMain.handle('secure-storage:set', async (_event, key: string, value: string) => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value);
      store.set(key, encrypted.toString('base64'));
    } else {
      // Fallback to unencrypted storage with warning
      console.warn('Encryption not available, storing unencrypted');
      store.set(key, value);
    }
    return { success: true };
  } catch (error) {
    console.error('Storage error:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('secure-storage:get', async (_event, key: string) => {
  try {
    const stored = store.get(key);
    if (!stored) {
      return { success: true, data: null };
    }

    if (safeStorage.isEncryptionAvailable() && typeof stored === 'string') {
      const buffer = Buffer.from(stored, 'base64');
      const decrypted = safeStorage.decryptString(buffer);
      return { success: true, data: decrypted };
    } else {
      return { success: true, data: stored };
    }
  } catch (error) {
    console.error('Storage retrieval error:', error);
    return { success: false, error: String(error), data: null };
  }
});

ipcMain.handle('secure-storage:remove', async (_event, key: string) => {
  try {
    store.delete(key);
    return { success: true };
  } catch (error) {
    console.error('Storage removal error:', error);
    return { success: false, error: String(error) };
  }
});

// App info
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:get-platform', () => {
  return process.platform;
});
