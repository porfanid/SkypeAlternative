import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - should be provided via environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private db: Firestore;
  private auth: Auth;
  private initialized: boolean = false;

  private constructor() {
    // Check if Firebase config is provided
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase configuration not provided. Some features will be disabled.');
      throw new Error('Firebase not configured');
    }

    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
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
    return this.db;
  }

  getAuth(): Auth {
    if (!this.initialized) {
      throw new Error('Firebase not initialized');
    }
    return this.auth;
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

export default getFirebaseService;
