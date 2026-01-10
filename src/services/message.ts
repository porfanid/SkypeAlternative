import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseService } from './firebase';
import { encryptMessage, decryptMessage } from '@utils/crypto';
import { Message } from '@models/index';
import storageService from './storage';

class MessageService {
  private static instance: MessageService;
  private listeners: Map<string, Unsubscribe> = new Map();

  private constructor() {}

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Send an encrypted message
   */
  async sendMessage(
    recipientId: string,
    recipientPublicKey: string,
    content: string,
    senderPrivateKey: string,
    senderId: string
  ): Promise<Message> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      // Encrypt the message
      const encrypted = encryptMessage(content, recipientPublicKey, senderPrivateKey);

      // Create message object
      const message: Message = {
        id: `${senderId}_${recipientId}_${Date.now()}`,
        senderId,
        recipientId,
        encryptedContent: JSON.stringify(encrypted),
        timestamp: Date.now(),
        status: 'sending',
      };

      // Store in Firebase with encrypted flag for security rules
      const messageRef = doc(db, 'messages', message.id);
      await setDoc(messageRef, {
        ...message,
        encrypted: true, // Required by security rules
        timestamp: Timestamp.fromMillis(message.timestamp),
      });

      // Update status
      message.status = 'sent';
      await setDoc(messageRef, {
        ...message,
        encrypted: true, // Required by security rules
        timestamp: Timestamp.fromMillis(message.timestamp),
      });

      // Cache locally
      await this.cacheMessage(message);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Retrieve messages for a conversation
   */
  async getMessages(
    userId: string,
    otherUserId: string,
    limit: number = 50
  ): Promise<Message[]> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const messagesRef = collection(db, 'messages');
      
      // Query messages in both directions
      const q1 = query(
        messagesRef,
        where('senderId', '==', userId),
        where('recipientId', '==', otherUserId),
        orderBy('timestamp', 'desc')
      );

      const q2 = query(
        messagesRef,
        where('senderId', '==', otherUserId),
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      const messages: Message[] = [];

      snapshot1.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          recipientId: data.recipientId,
          encryptedContent: data.encryptedContent,
          timestamp: data.timestamp.toMillis(),
          status: data.status,
        });
      });

      snapshot2.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          recipientId: data.recipientId,
          encryptedContent: data.encryptedContent,
          timestamp: data.timestamp.toMillis(),
          status: data.status,
        });
      });

      // Sort by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp);

      // Cache messages
      await this.cacheMessages(messages);

      return messages.slice(-limit);
    } catch (error) {
      console.error('Error retrieving messages:', error);
      
      // Try to load from cache
      const cached = await this.getCachedMessages();
      return cached.filter(
        (m) =>
          (m.senderId === userId && m.recipientId === otherUserId) ||
          (m.senderId === otherUserId && m.recipientId === userId)
      );
    }
  }

  /**
   * Decrypt a message
   */
  decryptMessage(
    message: Message,
    recipientPrivateKey: string,
    senderPublicKey: string
  ): string {
    try {
      const encrypted = JSON.parse(message.encryptedContent);
      return decryptMessage(encrypted, recipientPrivateKey, senderPublicKey);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return '[Unable to decrypt message]';
    }
  }

  /**
   * Listen for new messages in real-time
   */
  listenForMessages(
    userId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('recipientId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            senderId: data.senderId,
            recipientId: data.recipientId,
            encryptedContent: data.encryptedContent,
            timestamp: data.timestamp.toMillis(),
            status: data.status,
          });
        });
        callback(messages);
      });

      const listenerId = `messages_${userId}`;
      this.listeners.set(listenerId, unsubscribe);

      return () => {
        unsubscribe();
        this.listeners.delete(listenerId);
      };
    } catch (error) {
      console.error('Error setting up message listener:', error);
      return () => {};
    }
  }

  /**
   * Cache messages locally
   */
  private async cacheMessage(message: Message): Promise<void> {
    try {
      const cached = await this.getCachedMessages();
      cached.push(message);
      await storageService.storeMessages(cached);
    } catch (error) {
      console.error('Error caching message:', error);
    }
  }

  /**
   * Cache multiple messages
   */
  private async cacheMessages(messages: Message[]): Promise<void> {
    try {
      await storageService.storeMessages(messages);
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  /**
   * Get cached messages
   */
  private async getCachedMessages(): Promise<Message[]> {
    try {
      return await storageService.getMessages();
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }
}

export default MessageService.getInstance();
