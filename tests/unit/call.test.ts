/**
 * Tests for Call Service
 */

import { callService } from '../../src/services/call';

// Mock Firebase
jest.mock('../../src/services/firebase', () => ({
  db: {}
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
    now: jest.fn(() => ({ toMillis: () => Date.now() }))
  }
}));

// Mock crypto utils
jest.mock('../../src/utils/crypto', () => ({
  encryptMessage: jest.fn((msg) => `encrypted_${msg}`),
  decryptMessage: jest.fn((msg) => msg.replace('encrypted_', ''))
}));

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

// Mock RTCPeerConnection
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-offer-sdp' }),
  createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer-sdp' }),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  addIceCandidate: jest.fn().mockResolvedValue(undefined),
  addTrack: jest.fn(),
  close: jest.fn(),
  onicecandidate: null,
  ontrack: null
})) as any;

global.RTCSessionDescription = jest.fn().mockImplementation((desc) => desc) as any;
global.RTCIceCandidate = jest.fn().mockImplementation((cand) => cand) as any;

describe('Call Service', () => {
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
    it('should initiate a call with video and audio', async () => {
      const recipientId = 'recipient123';
      const recipientPublicKey = 'recipient_pub_key';
      const initiatorPrivateKey = 'initiator_priv_key';
      const constraints = { video: true, audio: true };

      // Mock storage service
      jest.spyOn(require('../../src/services/storage').default, 'getItem')
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
    });

    it('should initiate an audio-only call', async () => {
      const recipientId = 'recipient123';
      const recipientPublicKey = 'recipient_pub_key';
      const initiatorPrivateKey = 'initiator_priv_key';
      const constraints = { video: false, audio: true };

      jest.spyOn(require('../../src/services/storage').default, 'getItem')
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
    });

    it('should throw error when media access is denied', async () => {
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

      jest.spyOn(require('../../src/services/storage').default, 'getItem')
        .mockResolvedValue('initiator123');

      await expect(
        callService.initiateCall('recipient123', 'pub_key', 'priv_key', { video: true, audio: true })
      ).rejects.toThrow('Failed to initiate call');
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
    it('should return remote stream when available', () => {
      const mockStream = { id: 'remote-stream' };
      (callService as any).remoteStream = mockStream;

      const stream = callService.getRemoteStream();

      expect(stream).toBe(mockStream);
    });

    it('should return null when no remote stream', () => {
      (callService as any).remoteStream = null;

      const stream = callService.getRemoteStream();

      expect(stream).toBeNull();
    });
  });
});
