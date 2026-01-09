import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseService } from './firebase';
import { Message, MessageReaction, GroupChat, GroupMessage } from '@models/index';
import { encryptMessage } from '@utils/crypto';
import storageService from './storage';

class EnhancedMessageService {
  private static instance: EnhancedMessageService;

  private constructor() {}

  static getInstance(): EnhancedMessageService {
    if (!EnhancedMessageService.instance) {
      EnhancedMessageService.instance = new EnhancedMessageService();
    }
    return EnhancedMessageService.instance;
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const messageRef = doc(db, 'messages', messageId);

      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;
      const reactions = messageData.reactions || [];

      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        r => r.userId === userId && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction if already exists (toggle)
        const updatedReactions = reactions.filter(
          r => !(r.userId === userId && r.emoji === emoji)
        );
        await updateDoc(messageRef, { reactions: updatedReactions });
      } else {
        // Add new reaction
        const newReaction: MessageReaction = {
          emoji,
          userId,
          timestamp: Date.now(),
        };
        await updateDoc(messageRef, {
          reactions: [...reactions, newReaction],
        });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Edit a message (only updates encrypted content)
   */
  async editMessage(
    messageId: string,
    newContent: string,
    recipientPublicKey: string,
    senderPrivateKey: string,
    userId: string
  ): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const messageRef = doc(db, 'messages', messageId);

      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;
      if (messageData.senderId !== userId) {
        throw new Error('Only sender can edit message');
      }

      // Encrypt new content
      const encrypted = encryptMessage(newContent, recipientPublicKey, senderPrivateKey);

      await updateDoc(messageRef, {
        encryptedContent: JSON.stringify(encrypted),
        editedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete - marks as deleted)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const messageRef = doc(db, 'messages', messageId);

      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;
      if (messageData.senderId !== userId) {
        throw new Error('Only sender can delete message');
      }

      await updateDoc(messageRef, {
        deletedAt: Date.now(),
        encryptedContent: '', // Clear content
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Send a self-destructing message
   */
  async sendExpiringMessage(
    recipientId: string,
    recipientPublicKey: string,
    content: string,
    senderPrivateKey: string,
    senderId: string,
    expiresInMs: number // Time in milliseconds until message expires
  ): Promise<Message> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      // Encrypt the message
      const encrypted = encryptMessage(content, recipientPublicKey, senderPrivateKey);

      // Create message object with expiration
      const message: Message = {
        id: `${senderId}_${recipientId}_${Date.now()}`,
        senderId,
        recipientId,
        encryptedContent: JSON.stringify(encrypted),
        timestamp: Date.now(),
        status: 'sending',
        expiresAt: Date.now() + expiresInMs,
      };

      // Store in Firebase
      const messageRef = doc(db, 'messages', message.id);
      await setDoc(messageRef, {
        ...message,
        timestamp: Timestamp.now(),
      });

      // Also cache locally
      await this.cacheMessage(message);

      return message;
    } catch (error) {
      console.error('Error sending expiring message:', error);
      throw error;
    }
  }

  /**
   * Clean up expired messages
   */
  async cleanupExpiredMessages(): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('expiresAt', '<=', Date.now())
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          deletedAt: Date.now(),
          encryptedContent: '',
        })
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error cleaning up expired messages:', error);
      throw error;
    }
  }

  /**
   * Create a group chat
   */
  async createGroupChat(
    name: string,
    creatorId: string,
    memberIds: string[],
    memberPublicKeys: { [userId: string]: string }
  ): Promise<GroupChat> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      // Generate a group key (symmetric key for group encryption)
      const groupKey = crypto.getRandomValues(new Uint8Array(32));
      const groupKeyBase64 = btoa(String.fromCharCode(...groupKey));

      const groupChat: GroupChat = {
        id: `group_${creatorId}_${Date.now()}`,
        name,
        creatorId,
        memberIds: [creatorId, ...memberIds],
        memberPublicKeys,
        encryptedGroupKey: groupKeyBase64, // In production, encrypt this for each member
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };

      const groupRef = doc(db, 'groups', groupChat.id);
      await setDoc(groupRef, {
        ...groupChat,
        createdAt: Timestamp.now(),
        lastActivity: Timestamp.now(),
      });

      return groupChat;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  }

  /**
   * Send a message to a group
   */
  async sendGroupMessage(
    groupId: string,
    content: string,
    senderId: string,
    senderPrivateKey: string,
    memberPublicKeys: { [userId: string]: string }
  ): Promise<GroupMessage> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      // Encrypt content for each member
      const encryptedForMembers: { [userId: string]: string } = {};
      for (const [userId, publicKey] of Object.entries(memberPublicKeys)) {
        const encrypted = encryptMessage(content, publicKey, senderPrivateKey);
        encryptedForMembers[userId] = JSON.stringify(encrypted);
      }

      const groupMessage: GroupMessage = {
        id: `${groupId}_${senderId}_${Date.now()}`,
        senderId,
        groupId,
        encryptedContent: '', // Not used for group messages
        encryptedForMembers,
        timestamp: Date.now(),
        status: 'sending',
      };

      const messageRef = doc(db, 'group_messages', groupMessage.id);
      await setDoc(messageRef, {
        ...groupMessage,
        timestamp: Timestamp.now(),
      });

      // Update group last activity
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        lastActivity: Timestamp.now(),
      });

      return groupMessage;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  /**
   * Search local message history
   */
  async searchMessages(
    searchTerm: string,
    userId: string,
    decryptFn: (encrypted: string) => string
  ): Promise<Message[]> {
    try {
      // Get cached messages
      const cachedMessages = await storageService.getMessages();
      
      // Filter messages involving the user
      const userMessages = cachedMessages.filter(
        m => m.senderId === userId || m.recipientId === userId
      );

      // Decrypt and search
      const results: Message[] = [];
      for (const message of userMessages) {
        try {
          const decrypted = decryptFn(message.encryptedContent);
          if (decrypted.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(message);
          }
        } catch {
          // Skip messages that can't be decrypted
          continue;
        }
      }

      return results.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Cache a message locally
   */
  private async cacheMessage(message: Message): Promise<void> {
    try {
      const cachedMessages = await storageService.getMessages();
      cachedMessages.push(message);
      
      // Keep only last 1000 messages
      const recentMessages = cachedMessages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000);
      
      await storageService.storeMessages(recentMessages);
    } catch (error) {
      console.error('Error caching message:', error);
    }
  }
}

export default EnhancedMessageService.getInstance();
