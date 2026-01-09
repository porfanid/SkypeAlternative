import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - should be provided via environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _db: Firestore;
  private _auth: Auth;
  private initialized: boolean = false;

  private constructor() {
    // Check if Firebase config is provided
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase configuration not provided. Some features will be disabled.');
      throw new Error('Firebase not configured');
    }

    this.app = initializeApp(firebaseConfig);
    this._db = getFirestore(this.app);
    this._auth = getAuth(this.app);
    this.initialized = true;
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      try {
        FirebaseService.instance = new FirebaseService();
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
    return FirebaseService.instance;
  }

  getFirestore(): Firestore {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this._db;
  }

  getAuth(): Auth {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this._auth;
  }

  getApp(): FirebaseApp {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this.app;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance getter
let firebaseService: FirebaseService | null = null;

export const getFirebaseService = (): FirebaseService => {
  if (!firebaseService) {
    firebaseService = FirebaseService.getInstance();
  }
  return firebaseService;
};

// Lazy-loaded exports for convenience
// These will only initialize Firebase when first accessed
let _dbInstance: Firestore | null = null;
let _authInstance: Auth | null = null;

export const getDb = (): Firestore => {
  if (!_dbInstance) {
    _dbInstance = getFirebaseService().getFirestore();
  }
  return _dbInstance;
};

export const getAuthInstance = (): Auth => {
  if (!_authInstance) {
    _authInstance = getFirebaseService().getAuth();
  }
  return _authInstance;
};

// For backward compatibility - use getDb() instead
export { getDb as db, getAuthInstance as auth };

export default getFirebaseService;
