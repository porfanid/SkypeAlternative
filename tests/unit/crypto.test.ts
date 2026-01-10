import {
  generateMnemonic,
  validateMnemonic,
  deriveKeyPairFromMnemonic,
  generateSessionKey,
  encryptMessage,
  decryptMessage,
  signMessage,
  verifySignature,
  hashMessage,
} from '@utils/crypto';

describe('Crypto Utils', () => {
  describe('generateMnemonic', () => {
    it('should generate a valid 12-word mnemonic', () => {
      const mnemonic = generateMnemonic();
      const words = mnemonic.split(' ');
      
      expect(words).toHaveLength(12);
      expect(validateMnemonic(mnemonic)).toBe(true);
    });

    it('should generate different mnemonics each time', () => {
      const mnemonic1 = generateMnemonic();
      const mnemonic2 = generateMnemonic();
      
      expect(mnemonic1).not.toBe(mnemonic2);
    });
  });

  describe('validateMnemonic', () => {
    it('should validate correct mnemonics', () => {
      const mnemonic = generateMnemonic();
      expect(validateMnemonic(mnemonic)).toBe(true);
    });

    it('should reject invalid mnemonics', () => {
      expect(validateMnemonic('invalid mnemonic phrase')).toBe(false);
      expect(validateMnemonic('word1 word2 word3')).toBe(false);
      expect(validateMnemonic('')).toBe(false);
    });
  });

  describe('deriveKeyPairFromMnemonic', () => {
    it('should derive a key pair from a valid mnemonic', () => {
      const mnemonic = generateMnemonic();
      const keyPair = deriveKeyPairFromMnemonic(mnemonic);
      
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey.length).toBeGreaterThan(0);
      expect(keyPair.privateKey.length).toBeGreaterThan(0);
    });

    it('should derive the same key pair from the same mnemonic', () => {
      const mnemonic = generateMnemonic();
      const keyPair1 = deriveKeyPairFromMnemonic(mnemonic);
      const keyPair2 = deriveKeyPairFromMnemonic(mnemonic);
      
      expect(keyPair1.publicKey).toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).toBe(keyPair2.privateKey);
    });

    it('should throw error for invalid mnemonic', () => {
      expect(() => {
        deriveKeyPairFromMnemonic('invalid mnemonic');
      }).toThrow('Invalid mnemonic phrase');
    });
  });

  describe('generateSessionKey', () => {
    it('should generate a session key of correct length', () => {
      const sessionKey = generateSessionKey();
      expect(sessionKey).toBeInstanceOf(Uint8Array);
      expect(sessionKey.length).toBe(32); // nacl.secretbox.keyLength
    });

    it('should generate different session keys each time', () => {
      const key1 = generateSessionKey();
      const key2 = generateSessionKey();
      
      expect(key1).not.toEqual(key2);
    });
  });

  describe('encryptMessage and decryptMessage', () => {
    let aliceKeyPair: { publicKey: string; privateKey: string };
    let bobKeyPair: { publicKey: string; privateKey: string };

    beforeEach(() => {
      const aliceMnemonic = generateMnemonic();
      const bobMnemonic = generateMnemonic();
      aliceKeyPair = deriveKeyPairFromMnemonic(aliceMnemonic);
      bobKeyPair = deriveKeyPairFromMnemonic(bobMnemonic);
    });

    it('should encrypt and decrypt a message successfully', () => {
      const originalMessage = 'Hello, this is a secret message!';
      
      const encrypted = encryptMessage(
        originalMessage,
        bobKeyPair.publicKey,
        aliceKeyPair.privateKey
      );
      
      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('nonce');
      expect(encrypted).toHaveProperty('ephemeralPublicKey');
      
      const decrypted = decryptMessage(
        encrypted,
        bobKeyPair.privateKey,
        aliceKeyPair.publicKey
      );
      
      expect(decrypted).toBe(originalMessage);
    });

    it('should produce different ciphertexts for the same message', () => {
      const message = 'Test message';
      
      const encrypted1 = encryptMessage(
        message,
        bobKeyPair.publicKey,
        aliceKeyPair.privateKey
      );
      const encrypted2 = encryptMessage(
        message,
        bobKeyPair.publicKey,
        aliceKeyPair.privateKey
      );
      
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
    });

    it('should handle unicode characters', () => {
      const message = '你好世界 🌍 مرحبا';
      
      const encrypted = encryptMessage(
        message,
        bobKeyPair.publicKey,
        aliceKeyPair.privateKey
      );
      const decrypted = decryptMessage(
        encrypted,
        bobKeyPair.privateKey,
        aliceKeyPair.publicKey
      );
      
      expect(decrypted).toBe(message);
    });

    it('should fail to decrypt with wrong private key', () => {
      const message = 'Secret message';
      const wrongKeyPair = deriveKeyPairFromMnemonic(generateMnemonic());
      
      const encrypted = encryptMessage(
        message,
        bobKeyPair.publicKey,
        aliceKeyPair.privateKey
      );
      
      expect(() => {
        decryptMessage(
          encrypted,
          wrongKeyPair.privateKey,
          aliceKeyPair.publicKey
        );
      }).toThrow('Decryption failed');
    });
  });

  describe('signMessage and verifySignature', () => {
    let keyPair: { publicKey: string; privateKey: string };

    beforeEach(() => {
      const mnemonic = generateMnemonic();
      keyPair = deriveKeyPairFromMnemonic(mnemonic);
    });

    it('should sign and verify a message successfully', () => {
      const message = 'This message needs to be signed';
      
      const signature = signMessage(message, keyPair.privateKey);
      
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
      
      const isValid = verifySignature(message, signature, keyPair.publicKey);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const message = 'Original message';
      const signature = signMessage(message, keyPair.privateKey);
      
      const tamperedMessage = 'Tampered message';
      const isValid = verifySignature(tamperedMessage, signature, keyPair.publicKey);
      
      expect(isValid).toBe(false);
    });

    it('should reject signatures from wrong public key', () => {
      const message = 'Test message';
      const signature = signMessage(message, keyPair.privateKey);
      
      const wrongKeyPair = deriveKeyPairFromMnemonic(generateMnemonic());
      const isValid = verifySignature(message, signature, wrongKeyPair.publicKey);
      
      expect(isValid).toBe(false);
    });

    it('should handle malformed signatures gracefully', () => {
      const message = 'Test message';
      const invalidSignature = 'not-a-valid-signature';
      
      const isValid = verifySignature(message, invalidSignature, keyPair.publicKey);
      
      expect(isValid).toBe(false);
    });
  });

  describe('hashMessage', () => {
    it('should hash a message', () => {
      const message = 'Message to hash';
      const hash = hashMessage(message);
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce the same hash for the same message', () => {
      const message = 'Consistent message';
      const hash1 = hashMessage(message);
      const hash2 = hashMessage(message);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different messages', () => {
      const hash1 = hashMessage('Message 1');
      const hash2 = hashMessage('Message 2');
      
      expect(hash1).not.toBe(hash2);
    });
  });
});
