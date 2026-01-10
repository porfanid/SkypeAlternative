import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  safeStorage: {
    setItem: async (key: string, value: string): Promise<void> => {
      const result = await ipcRenderer.invoke('secure-storage:set', key, value);
      if (!result.success) {
        throw new Error('Storage operation failed');
      }
    },
    getItem: async (key: string): Promise<string | null> => {
      const result = await ipcRenderer.invoke('secure-storage:get', key);
      if (!result.success) {
        throw new Error('Storage retrieval failed');
      }
      return result.data;
    },
    removeItem: async (key: string): Promise<void> => {
      const result = await ipcRenderer.invoke('secure-storage:remove', key);
      if (!result.success) {
        throw new Error('Storage removal failed');
      }
    },
  },
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
    getPlatform: (): Promise<string> => ipcRenderer.invoke('app:get-platform'),
  },
});
