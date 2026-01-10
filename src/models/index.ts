export interface User {
  id: string;
  publicKey: string;
  username: string;
  createdAt: number;
}

export interface Friend {
  userId: string;
  publicKey: string;
  username: string;
  addedAt: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromPublicKey: string;
  fromUsername: string;
  toPublicKey: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  encryptedContent: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  // Enhanced features
  editedAt?: number;
  deletedAt?: number;
  expiresAt?: number; // For self-destructing messages
  replyToMessageId?: string; // For threading
  reactions?: MessageReaction[];
  // Group chat support
  groupId?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: number;
}

export interface GroupChat {
  id: string;
  name: string;
  creatorId: string;
  memberIds: string[];
  memberPublicKeys: { [userId: string]: string };
  encryptedGroupKey: string; // Encrypted with each member's public key
  createdAt: number;
  lastActivity: number;
}

export interface GroupMessage extends Omit<Message, 'recipientId'> {
  groupId: string;
  encryptedForMembers: { [userId: string]: string }; // Content encrypted for each member
}

export interface CallSession {
  id: string;
  callerId: string;
  recipientId: string;
  status: 'initiating' | 'ringing' | 'active' | 'ended';
  startTime?: number;
  endTime?: number;
  cloudflareSessionId?: string;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface StoredKeyPair extends KeyPair {
  mnemonic: string;
}

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  ephemeralPublicKey: string;
}

export interface AuthChallenge {
  challenge: string;
  timestamp: number;
}

export interface AuthResponse {
  challenge: string;
  signature: string;
  publicKey: string;
}
