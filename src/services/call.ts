/**
 * Call Service - WebRTC video/audio calls using Cloudflare Calls SFU
 * 
 * This service manages:
 * - Call signaling (encrypted)
 * - Cloudflare SFU connection setup
 * - Media stream management
 * - Call state management
 */

import { getDb } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { encryptMessage, decryptMessage } from '../utils/crypto';
import { cloudflareCallsService } from './cloudflareCall';
import { CallSignalData } from '../models';

export interface CallState {
  callId: string;
  initiatorId: string;
  recipientId: string;
  status: 'ringing' | 'in-progress' | 'ended' | 'missed' | 'rejected';
  startTime?: number;
  endTime?: number;
  duration?: number;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  cloudflareSessionId?: string;
}

export interface MediaConstraints {
  video: boolean;
  audio: boolean;
}

class CallService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private signalUnsubscribe: (() => void) | null = null;

  /**
   * Initialize a new call using Cloudflare SFU
   */
  async initiateCall(
    recipientId: string,
    recipientPublicKey: string,
    initiatorPrivateKey: string,
    constraints: MediaConstraints
  ): Promise<string> {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const initiatorId = await this.getCurrentUserId();

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video,
        audio: constraints.audio
      });

      // Request Cloudflare session credentials
      const credentials = await cloudflareCallsService.requestSessionCredentials(initiatorId);

      // Publish local stream to Cloudflare
      await cloudflareCallsService.publishTrack(credentials, this.localStream);

      // Create call document in Firebase
      const callRef = doc(getDb(), 'calls', callId);
      await setDoc(callRef, {
        callId,
        initiatorId,
        recipientId,
        status: 'ringing',
        startTime: Timestamp.now(),
        isVideoEnabled: constraints.video,
        isAudioEnabled: constraints.audio,
        cloudflareSessionId: credentials.sessionId,
        createdAt: Timestamp.now()
      });

      this.currentCallId = callId;

      // Send Cloudflare session info to recipient
      await this.sendSignal(callId, recipientId, recipientPublicKey, initiatorPrivateKey, {
        type: 'cloudflare-session',
        sessionId: credentials.sessionId,
        trackName: credentials.tracks.trackName,
        from: initiatorId,
        to: recipientId,
        timestamp: Date.now()
      });

      // Listen for signals
      this.listenForSignals(callId, initiatorId, initiatorPrivateKey, recipientPublicKey);

      return callId;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.cleanup();
      throw new Error('Failed to initiate call');
    }
  }

  /**
   * Answer an incoming call using Cloudflare SFU
   */
  async answerCall(
    callId: string,
    initiatorPublicKey: string,
    recipientPrivateKey: string,
    constraints: MediaConstraints
  ): Promise<void> {
    try {
      const recipientId = await this.getCurrentUserId();

      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video,
        audio: constraints.audio
      });

      // Get the Cloudflare session info from signals
      const signalsRef = collection(getDb(), 'calls', callId, 'signals');
      const sessionSnapshot = await getDoc(doc(signalsRef, 'cloudflare-session'));
      
      if (!sessionSnapshot.exists()) {
        throw new Error('Cloudflare session not found');
      }

      const encryptedSession = sessionSnapshot.data();
      const decryptedSession = decryptMessage(
        encryptedSession.data,
        recipientPrivateKey,
        initiatorPublicKey
      );
      // Parse session data (currently unused, but available for future use)
      // const sessionData = JSON.parse(decryptedSession);

      // Request own session credentials
      const credentials = await cloudflareCallsService.requestSessionCredentials(recipientId);

      // Publish local stream to Cloudflare
      await cloudflareCallsService.publishTrack(credentials, this.localStream);

      // Subscribe to initiator's track using their session info
      // In a real implementation, you would use the sessionData to connect to the same SFU session
      this.remoteStream = await cloudflareCallsService.subscribeToTrack(credentials);

      // Update call status
      const callRef = doc(getDb(), 'calls', callId);
      await updateDoc(callRef, {
        status: 'in-progress',
        answerTime: Timestamp.now()
      });

      this.currentCallId = callId;

      // Listen for signals
      this.listenForSignals(callId, recipientId, recipientPrivateKey, initiatorPublicKey);
    } catch (error) {
      console.error('Failed to answer call:', error);
      this.cleanup();
      throw new Error('Failed to answer call');
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<void> {
    try {
      const callRef = doc(getDb(), 'calls', callId);
      await updateDoc(callRef, {
        status: 'rejected',
        endTime: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to reject call:', error);
      throw new Error('Failed to reject call');
    }
  }

  /**
   * End an ongoing call
   */
  async endCall(callId: string): Promise<void> {
    try {
      const callRef = doc(getDb(), 'calls', callId);
      const callDoc = await getDoc(callRef);
      
      if (callDoc.exists()) {
        const callData = callDoc.data();
        const startTime = callData.answerTime?.toMillis() || callData.startTime?.toMillis();
        const endTime = Date.now();
        const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

        await updateDoc(callRef, {
          status: 'ended',
          endTime: Timestamp.now(),
          duration
        });
      }

      // Clean up
      this.cleanup();
    } catch (error) {
      console.error('Failed to end call:', error);
      throw new Error('Failed to end call');
    }
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get local media stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote media stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream || cloudflareCallsService.getRemoteStream();
  }

  /**
   * Listen for incoming calls
   */
  listenForIncomingCalls(
    userId: string,
    callback: (call: CallState) => void
  ): () => void {
    const callsRef = collection(getDb(), 'calls');
    
    const unsubscribe = onSnapshot(callsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const callData = change.doc.data();
          if (callData.recipientId === userId && callData.status === 'ringing') {
            callback({
              callId: callData.callId,
              initiatorId: callData.initiatorId,
              recipientId: callData.recipientId,
              status: callData.status,
              startTime: callData.startTime?.toMillis(),
              isVideoEnabled: callData.isVideoEnabled,
              isAudioEnabled: callData.isAudioEnabled
            });
          }
        }
      });
    });

    return unsubscribe;
  }

  /**
   * Send encrypted signal
   */
  private async sendSignal(
    callId: string,
    recipientId: string,
    recipientPublicKey: string,
    senderPrivateKey: string,
    signal: CallSignalData
  ): Promise<void> {
    try {
      const signalData = JSON.stringify({
        sessionId: signal.sessionId,
        trackName: signal.trackName
      });

      const encryptedData = encryptMessage(
        signalData,
        recipientPublicKey,
        senderPrivateKey
      );

      const signalRef = doc(getDb(), 'calls', callId, 'signals', signal.type);
      await setDoc(signalRef, {
        type: signal.type,
        data: encryptedData,
        from: signal.from,
        to: signal.to,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to send signal:', error);
    }
  }

  /**
   * Listen for signals
   */
  private listenForSignals(
    callId: string,
    userId: string,
    userPrivateKey: string,
    peerPublicKey: string
  ): void {
    const signalsRef = collection(getDb(), 'calls', callId, 'signals');
    
    this.signalUnsubscribe = onSnapshot(signalsRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const signalData = change.doc.data();
          
          if (signalData.to === userId) {
            try {
              // Decrypt signal data (unused currently, available for future use)
              // const decryptedData = decryptMessage(
              //   signalData.data,
              //   userPrivateKey,
              //   peerPublicKey
              // );

              if (signalData.type === 'hangup') {
                this.cleanup();
              }
              // Cloudflare session signals are handled in answerCall
            } catch (error) {
              console.error('Failed to process signal:', error);
            }
          }
        }
      });
    });
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.signalUnsubscribe) {
      this.signalUnsubscribe();
      this.signalUnsubscribe = null;
    }

    // Clean up Cloudflare resources
    cloudflareCallsService.cleanup();

    this.remoteStream = null;
    this.currentCallId = null;
  }

  /**
   * Get current user ID (helper method)
   */
  private async getCurrentUserId(): Promise<string> {
    // Implementation depends on auth service
    // For now, return from storage
    const storageService = (await import('./storage')).default;
    const userId = await storageService.getItem('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }
}

export const callService = new CallService();
