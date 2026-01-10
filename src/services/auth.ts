import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { getFirebaseService } from './firebase';
import { signMessage, verifySignature, hashMessage } from '@utils/crypto';
import { User, AuthChallenge, AuthResponse } from '@models/index';
import storageService from './storage';

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Generate a challenge for authentication
   */
  generateChallenge(): AuthChallenge {
    const challenge = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return {
      challenge,
      timestamp: Date.now(),
    };
  }

  /**
   * Sign a challenge with the user's private key
   */
  signChallenge(challenge: string, privateKey: string): string {
    return signMessage(challenge, privateKey);
  }

  /**
   * Verify a signed challenge
   */
  verifyChallenge(authResponse: AuthResponse): boolean {
    return verifySignature(
      authResponse.challenge,
      authResponse.signature,
      authResponse.publicKey
    );
  }

  /**
   * Register a new user
   */
  async register(publicKey: string, username: string): Promise<User> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const auth = firebase.getAuth();

      // Sign in anonymously to get Firebase Auth context
      await signInAnonymously(auth);

      // Create user ID from public key hash
      const userId = hashMessage(publicKey).substring(0, 20);

      // Check if user already exists
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        throw new Error('User already exists with this public key');
      }

      // Create new user
      const user: User = {
        id: userId,
        publicKey,
        username,
        createdAt: Date.now(),
      };

      await setDoc(userRef, {
        ...user,
        createdAt: Timestamp.fromMillis(user.createdAt),
      });

      this.currentUser = user;
      await storageService.storeUserData(user);

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with challenge-response authentication
   */
  async login(publicKey: string, privateKey: string): Promise<User> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const auth = firebase.getAuth();

      // Sign in anonymously to get Firebase Auth context
      await signInAnonymously(auth);

      // Generate challenge
      const challenge = this.generateChallenge();

      // Sign challenge
      const signature = this.signChallenge(challenge.challenge, privateKey);

      // Verify signature
      const authResponse: AuthResponse = {
        challenge: challenge.challenge,
        signature,
        publicKey,
      };

      if (!this.verifyChallenge(authResponse)) {
        throw new Error('Authentication failed: Invalid signature');
      }

      // Get user from database
      const userId = hashMessage(publicKey).substring(0, 20);
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found. Please register first.');
      }

      const userData = userDoc.data();
      const user: User = {
        id: userId,
        publicKey: userData.publicKey,
        username: userData.username,
        createdAt: userData.createdAt.toMillis(),
      };

      this.currentUser = user;
      await storageService.storeUserData(user);

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    await storageService.clearAll();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Load user from storage
   */
  async loadStoredUser(): Promise<User | null> {
    try {
      const userData = await storageService.getUserData();
      if (userData) {
        this.currentUser = userData;
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error loading stored user:', error);
      return null;
    }
  }

  /**
   * Find user by public key
   */
  async findUserByPublicKey(publicKey: string): Promise<User | null> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      // Compute userId from public key hash (same as registration)
      const userId = hashMessage(publicKey).substring(0, 20);
      
      // Use direct document access instead of query to comply with security rules
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      
      // Verify the public key matches (in case of hash collision)
      if (userData.publicKey !== publicKey) {
        return null;
      }
      
      return {
        id: userDoc.id,
        publicKey: userData.publicKey,
        username: userData.username,
        createdAt: userData.createdAt.toMillis(),
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }
}

export default AuthService.getInstance();
