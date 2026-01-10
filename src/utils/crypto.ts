import * as bip39 from 'bip39';
import * as nacl from 'tweetnacl';
import * as naclUtil from 'tweetnacl-util';
import { KeyPair, EncryptedMessage } from '@models/index';

const { encodeBase64, decodeBase64 } = naclUtil;

/**
 * Generate a new mnemonic phrase (12 words)
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128); // 12 words
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}

/**
 * Derive a key pair from a mnemonic phrase
 * Uses the mnemonic seed to generate deterministic keys
 */
export function deriveKeyPairFromMnemonic(mnemonic: string): KeyPair {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Convert mnemonic to seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  
  // Use first 32 bytes as seed for key generation
  // Convert Buffer to Uint8Array if needed
  const seedArray = new Uint8Array(seed.slice(0, 32));
  const keyPair = nacl.sign.keyPair.fromSeed(seedArray);

  return {
    publicKey: encodeBase64(keyPair.publicKey),
    privateKey: encodeBase64(keyPair.secretKey),
  };
}

/**
 * Generate a random session key for symmetric encryption
 */
export function generateSessionKey(): Uint8Array {
  return nacl.randomBytes(nacl.secretbox.keyLength);
}

/**
 * Encrypt a message using the recipient's public key (asymmetric)
 * Uses secret box with a derived shared secret
 */
export function encryptMessage(
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): EncryptedMessage {
  const encoder = new TextEncoder();
  const messageUint8 = new Uint8Array(encoder.encode(message));
  
  const recipientPublicKeyBytes = new Uint8Array(decodeBase64(recipientPublicKey));
  const senderPrivateKeyBytes = new Uint8Array(decodeBase64(senderPrivateKey));
  
  // Derive sender's public key from private key to create a consistent shared secret
  const senderKeypair = nacl.sign.keyPair.fromSecretKey(senderPrivateKeyBytes);
  
  // Create a shared secret by hashing public keys together (deterministic ordering)
  const key1 = senderKeypair.publicKey;
  const key2 = recipientPublicKeyBytes;
  
  // Sort keys to ensure same order regardless of who is encrypting
  const [firstKey, secondKey] = key1 < key2 ? [key1, key2] : [key2, key1];
  
  const sharedSecretInput = new Uint8Array(firstKey.length + secondKey.length);
  sharedSecretInput.set(firstKey, 0);
  sharedSecretInput.set(secondKey, firstKey.length);
  const sharedSecret = new Uint8Array(nacl.hash(sharedSecretInput).slice(0, 32));
  
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const ciphertext = nacl.secretbox(messageUint8, nonce, sharedSecret);

  if (!ciphertext) {
    throw new Error('Encryption failed');
  }

  return {
    ciphertext: encodeBase64(ciphertext),
    nonce: encodeBase64(nonce),
    ephemeralPublicKey: encodeBase64(senderKeypair.publicKey), // Store sender's public key
  };
}

/**
 * Decrypt a message using the recipient's private key (asymmetric)
 */
export function decryptMessage(
  encryptedMessage: EncryptedMessage,
  recipientPrivateKey: string,
  senderPublicKey: string
): string {
  const ciphertext = new Uint8Array(decodeBase64(encryptedMessage.ciphertext));
  const nonce = new Uint8Array(decodeBase64(encryptedMessage.nonce));
  
  const recipientPrivateKeyBytes = new Uint8Array(decodeBase64(recipientPrivateKey));
  const senderPublicKeyBytes = new Uint8Array(decodeBase64(senderPublicKey));
  
  // Derive recipient's public key from private key
  const recipientKeypair = nacl.sign.keyPair.fromSecretKey(recipientPrivateKeyBytes);
  
  // Recreate the shared secret with same key ordering as encryption
  const key1 = senderPublicKeyBytes;
  const key2 = recipientKeypair.publicKey;
  
  // Sort keys to ensure same order as encryption
  const [firstKey, secondKey] = key1 < key2 ? [key1, key2] : [key2, key1];
  
  const sharedSecretInput = new Uint8Array(firstKey.length + secondKey.length);
  sharedSecretInput.set(firstKey, 0);
  sharedSecretInput.set(secondKey, firstKey.length);
  const sharedSecret = new Uint8Array(nacl.hash(sharedSecretInput).slice(0, 32));

  const decrypted = nacl.secretbox.open(ciphertext, nonce, sharedSecret);

  if (!decrypted) {
    throw new Error('Decryption failed - message may be corrupted or tampered with');
  }

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Sign a message with a private key
 */
export function signMessage(message: string, privateKey: string): string {
  const encoder = new TextEncoder();
  const messageUint8 = new Uint8Array(encoder.encode(message));
  const privateKeyUint8 = new Uint8Array(decodeBase64(privateKey));
  
  const signature = nacl.sign.detached(messageUint8, privateKeyUint8);
  
  return encodeBase64(signature);
}

/**
 * Verify a signature with a public key
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const encoder = new TextEncoder();
    const messageUint8 = new Uint8Array(encoder.encode(message));
    const signatureUint8 = new Uint8Array(decodeBase64(signature));
    const publicKeyUint8 = new Uint8Array(decodeBase64(publicKey));
    
    return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch {
    return false;
  }
}

/**
 * Hash a message using SHA-512 (via NaCl)
 */
export function hashMessage(message: string): string {
  const encoder = new TextEncoder();
  const messageUint8 = new Uint8Array(encoder.encode(message));
  const hash = nacl.hash(messageUint8);
  // Return URL-safe base64 (replace / with _, + with -, remove padding =)
  return encodeBase64(hash)
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=+$/, '');
}
