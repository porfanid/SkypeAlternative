/**
 * Tests for Call Service with Cloudflare SFU
 */

import { callService } from '../../src/services/call';
import storageService from '../../src/services/storage';
import { cloudflareCallsService } from '../../src/services/cloudflareCall';

// Mock Firebase
jest.mock('../../src/services/firebase', () => ({
  getDb: jest.fn(() => ({})),
  getFirebaseService: jest.fn(() => ({
    getFirestore: jest.fn(() => ({})),
    getAuth: jest.fn(() => ({
      currentUser: {
        getIdToken: jest.fn().mockResolvedValue('mock-id-token')
      }
    }))
  })),
  getAuthInstance: jest.fn(() => ({
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('mock-id-token')
    }
  }))
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  deleteDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toMillis: () => Date.now() })),
    fromMillis: jest.fn((ms) => ({ toMillis: () => ms }))
  }
}));

// Mock crypto utils
jest.mock('../../src/utils/crypto', () => ({
  encryptMessage: jest.fn((msg) => `encrypted_${msg}`),
  decryptMessage: jest.fn((msg) => msg.replace('encrypted_', ''))
}));

// Mock Cloudflare Calls Service
jest.mock('../../src/services/cloudflareCall', () => ({
  cloudflareCallsService: {
    requestSessionCredentials: jest.fn().mockResolvedValue({
      sessionId: 'mock-session-id',
      tracks: {
        trackName: 'mock-track',
        location: 'wss://mock.cloudflare.com',
        sessionDescription: {
          type: 'offer',
          sdp: 'mock-sdp'
        }
      },
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }]
    }),
    publishTrack: jest.fn().mockResolvedValue(undefined),
    subscribeToTrack: jest.fn().mockResolvedValue(new MediaStream()),
    getLocalStream: jest.fn(() => null),
    getRemoteStream: jest.fn(() => null),
    getCurrentSessionId: jest.fn(() => 'mock-session-id'),
    cleanup: jest.fn()
  }
}));

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

describe('Call Service with Cloudflare SFU', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock MediaStream
    const mockTrack = {
      stop: jest.fn(),
      enabled: true
    };
    
    mockGetUserMedia.mockResolvedValue({
      getTracks: jest.fn(() => [mockTrack, mockTrack]),
      getVideoTracks: jest.fn(() => [mockTrack]),
      getAudioTracks: jest.fn(() => [mockTrack])
    });
  });

  describe('initiateCall', () => {
    it('should initiate a call with Cloudflare SFU', async () => {
      const recipientId = 'recipient123';
      const recipientPublicKey = 'recipient_pub_key';
      const initiatorPrivateKey = 'initiator_priv_key';
      const constraints = { video: true, audio: true };

      // Mock storage service
      jest.spyOn(storageService, 'getItem')
        .mockResolvedValue('initiator123');

      const callId = await callService.initiateCall(
        recipientId,
        recipientPublicKey,
        initiatorPrivateKey,
        constraints
      );

      expect(callId).toMatch(/^call_\d+_[a-z0-9]+$/);
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: true,
        audio: true
      });
      expect(cloudflareCallsService.requestSessionCredentials).toHaveBeenCalledWith('initiator123');
      expect(cloudflareCallsService.publishTrack).toHaveBeenCalled();
    });

    it('should initiate an audio-only call', async () => {
      const recipientId = 'recipient123';
      const recipientPublicKey = 'recipient_pub_key';
      const initiatorPrivateKey = 'initiator_priv_key';
      const constraints = { video: false, audio: true };

      jest.spyOn(storageService, 'getItem')
        .mockResolvedValue('initiator123');

      await callService.initiateCall(
        recipientId,
        recipientPublicKey,
        initiatorPrivateKey,
        constraints
      );

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: false,
        audio: true
      });
      expect(cloudflareCallsService.requestSessionCredentials).toHaveBeenCalled();
    });

    it('should throw error when media access is denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      jest.spyOn(storageService, 'getItem')
        .mockResolvedValue('initiator123');

      await expect(
        callService.initiateCall('recipient123', 'pub_key', 'priv_key', { video: true, audio: true })
      ).rejects.toThrow('Failed to initiate call');
    });

    it('should cleanup on failure', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      jest.spyOn(storageService, 'getItem')
        .mockResolvedValue('initiator123');

      await expect(
        callService.initiateCall('recipient123', 'pub_key', 'priv_key', { video: true, audio: true })
      ).rejects.toThrow();

      expect(cloudflareCallsService.cleanup).toHaveBeenCalled();
    });
  });

  describe('toggleVideo', () => {
    it('should enable video', () => {
      const mockTrack = { enabled: false };
      const localStream = {
        getVideoTracks: jest.fn(() => [mockTrack])
      };

      // Access private property for testing
      (callService as any).localStream = localStream;

      callService.toggleVideo(true);

      expect(mockTrack.enabled).toBe(true);
    });

    it('should disable video', () => {
      const mockTrack = { enabled: true };
      const localStream = {
        getVideoTracks: jest.fn(() => [mockTrack])
      };

      (callService as any).localStream = localStream;

      callService.toggleVideo(false);

      expect(mockTrack.enabled).toBe(false);
    });

    it('should handle no local stream gracefully', () => {
      (callService as any).localStream = null;

      expect(() => callService.toggleVideo(true)).not.toThrow();
    });
  });

  describe('toggleAudio', () => {
    it('should enable audio', () => {
      const mockTrack = { enabled: false };
      const localStream = {
        getAudioTracks: jest.fn(() => [mockTrack])
      };

      (callService as any).localStream = localStream;

      callService.toggleAudio(true);

      expect(mockTrack.enabled).toBe(true);
    });

    it('should disable audio', () => {
      const mockTrack = { enabled: true };
      const localStream = {
        getAudioTracks: jest.fn(() => [mockTrack])
      };

      (callService as any).localStream = localStream;

      callService.toggleAudio(false);

      expect(mockTrack.enabled).toBe(false);
    });

    it('should handle no local stream gracefully', () => {
      (callService as any).localStream = null;

      expect(() => callService.toggleAudio(true)).not.toThrow();
    });
  });

  describe('getLocalStream', () => {
    it('should return local stream when available', () => {
      const mockStream = { id: 'local-stream' };
      (callService as any).localStream = mockStream;

      const stream = callService.getLocalStream();

      expect(stream).toBe(mockStream);
    });

    it('should return null when no local stream', () => {
      (callService as any).localStream = null;

      const stream = callService.getLocalStream();

      expect(stream).toBeNull();
    });
  });

  describe('getRemoteStream', () => {
    it('should return remote stream from Cloudflare service', () => {
      const mockStream = new MediaStream();
      (cloudflareCallsService.getRemoteStream as jest.Mock).mockReturnValue(mockStream);

      const stream = callService.getRemoteStream();

      expect(stream).toBe(mockStream);
    });
  });
});
