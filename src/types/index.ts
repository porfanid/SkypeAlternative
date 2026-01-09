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
