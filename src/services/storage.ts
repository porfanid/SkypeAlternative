import { StoredKeyPair, Message, User } from '@models/index';

/**
 * Storage service for managing secure local storage
 * Uses Electron's safeStorage API when available, falls back to encrypted localStorage for web
 */
class StorageService {
  private static instance: StorageService;
  private readonly KEYS_STORAGE_KEY = 'secure_keys';
  private readonly MESSAGES_STORAGE_KEY = 'cached_messages';
  private readonly USER_DATA_KEY = 'user_data';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Check if Electron safeStorage is available
   */
  private isElectronAvailable(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      window.electron?.safeStorage
    );
  }

  /**
   * Store key pair securely
   */
  async storeKeyPair(keyPair: StoredKeyPair): Promise<void> {
    const data = JSON.stringify(keyPair);
    
    if (this.isElectronAvailable() && window.electron) {
      // Use Electron's secure storage
      await window.electron.safeStorage.setItem(this.KEYS_STORAGE_KEY, data);
    } else {
      // Fallback to localStorage with warning
      console.warn('Using localStorage for key storage. For production, use Electron or secure backend storage.');
      localStorage.setItem(this.KEYS_STORAGE_KEY, data);
    }
  }

  /**
   * Retrieve stored key pair
   */
  async getKeyPair(): Promise<StoredKeyPair | null> {
    try {
      let data: string | null;
      
      if (this.isElectronAvailable() && window.electron) {
        data = await window.electron.safeStorage.getItem(this.KEYS_STORAGE_KEY);
      } else {
        data = localStorage.getItem(this.KEYS_STORAGE_KEY);
      }
      
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving key pair:', error);
      return null;
    }
  }

  /**
   * Delete stored key pair (logout)
   */
  async deleteKeyPair(): Promise<void> {
    if (this.isElectronAvailable() && window.electron) {
      await window.electron.safeStorage.removeItem(this.KEYS_STORAGE_KEY);
    } else {
      localStorage.removeItem(this.KEYS_STORAGE_KEY);
    }
  }

  /**
   * Store cached messages
   */
  async storeMessages(messages: Message[]): Promise<void> {
    const data = JSON.stringify(messages);
    
    if (this.isElectronAvailable() && window.electron) {
      await window.electron.safeStorage.setItem(this.MESSAGES_STORAGE_KEY, data);
    } else {
      localStorage.setItem(this.MESSAGES_STORAGE_KEY, data);
    }
  }

  /**
   * Retrieve cached messages
   */
  async getMessages(): Promise<Message[]> {
    try {
      let data: string | null;
      
      if (this.isElectronAvailable() && window.electron) {
        data = await window.electron.safeStorage.getItem(this.MESSAGES_STORAGE_KEY);
      } else {
        data = localStorage.getItem(this.MESSAGES_STORAGE_KEY);
      }
      
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return [];
    }
  }

  /**
   * Store user data
   */
  async storeUserData(userData: User): Promise<void> {
    const data = JSON.stringify(userData);
    
    if (this.isElectronAvailable() && window.electron) {
      await window.electron.safeStorage.setItem(this.USER_DATA_KEY, data);
    } else {
      localStorage.setItem(this.USER_DATA_KEY, data);
    }
  }

  /**
   * Retrieve user data
   */
  async getUserData(): Promise<User | null> {
    try {
      let data: string | null;
      
      if (this.isElectronAvailable() && window.electron) {
        data = await window.electron.safeStorage.getItem(this.USER_DATA_KEY);
      } else {
        data = localStorage.getItem(this.USER_DATA_KEY);
      }
      
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    await this.deleteKeyPair();
    
    if (this.isElectronAvailable() && window.electron) {
      await window.electron.safeStorage.removeItem(this.MESSAGES_STORAGE_KEY);
      await window.electron.safeStorage.removeItem(this.USER_DATA_KEY);
    } else {
      localStorage.removeItem(this.MESSAGES_STORAGE_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
    }
  }
}

export default StorageService.getInstance();

// Type declaration for Electron API
declare global {
  interface Window {
    electron?: {
      safeStorage: {
        setItem: (key: string, value: string) => Promise<void>;
        getItem: (key: string) => Promise<string | null>;
        removeItem: (key: string) => Promise<void>;
      };
    };
  }
}
