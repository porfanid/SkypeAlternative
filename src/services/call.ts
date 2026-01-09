/**
 * Call Service - WebRTC video/audio calls using Cloudflare Calls
 * 
 * This service manages:
 * - Call signaling (encrypted)
 * - WebRTC connection setup
 * - Media stream management
 * - Call state management
 */

import { getDb } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import { encryptMessage, decryptMessage } from '../utils/crypto';

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
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hangup';
  data: string; // Encrypted signal data
  from: string;
  to: string;
  timestamp: number;
}

export interface MediaConstraints {
  video: boolean;
  audio: boolean;
}

class CallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private signalUnsubscribe: (() => void) | null = null;

  // ICE servers configuration (STUN/TURN)
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Cloudflare TURN servers (requires authentication)
    // Will be added when Cloudflare Calls is configured
  ];

  /**
   * Initialize a new call
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
        createdAt: Timestamp.now()
      });

      // Set up peer connection
      this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });
      this.currentCallId = callId;

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendSignal(callId, recipientId, recipientPublicKey, initiatorPrivateKey, {
            type: 'ice-candidate',
            data: JSON.stringify(event.candidate),
            from: initiatorId,
            to: recipientId,
            timestamp: Date.now()
          });
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
      };

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await this.sendSignal(callId, recipientId, recipientPublicKey, initiatorPrivateKey, {
        type: 'offer',
        data: JSON.stringify(offer),
        from: initiatorId,
        to: recipientId,
        timestamp: Date.now()
      });

      // Listen for signals
      this.listenForSignals(callId, initiatorId, initiatorPrivateKey, recipientPublicKey);

      return callId;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw new Error('Failed to initiate call');
    }
  }

  /**
   * Answer an incoming call
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

      // Update call status
      const callRef = doc(getDb(), 'calls', callId);
      await updateDoc(callRef, {
        status: 'in-progress',
        answerTime: Timestamp.now()
      });

      // Set up peer connection
      this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });
      this.currentCallId = callId;

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const callDoc = doc(getDb(), 'calls', callId);
          getDoc(callDoc).then(docSnap => {
            if (docSnap.exists()) {
              const initiatorId = docSnap.data().initiatorId;
              this.sendSignal(callId, initiatorId, initiatorPublicKey, recipientPrivateKey, {
                type: 'ice-candidate',
                data: JSON.stringify(event.candidate),
                from: recipientId,
                to: initiatorId,
                timestamp: Date.now()
              });
            }
          });
        }
      };

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
      };

      // Get the offer from signals
      const signalsRef = collection(getDb(), 'calls', callId, 'signals');
      const offerSnapshot = await getDoc(doc(signalsRef, 'offer'));
      
      if (offerSnapshot.exists()) {
        const encryptedOffer = offerSnapshot.data();
        const decryptedOffer = decryptMessage(
          encryptedOffer.data,
          recipientPrivateKey,
          initiatorPublicKey
        );
        const offer = JSON.parse(decryptedOffer);
        
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Create and send answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        const callDoc = await getDoc(callRef);
        const initiatorId = callDoc.data()?.initiatorId;
        
        await this.sendSignal(callId, initiatorId, initiatorPublicKey, recipientPrivateKey, {
          type: 'answer',
          data: JSON.stringify(answer),
          from: recipientId,
          to: initiatorId,
          timestamp: Date.now()
        });
      }

      // Listen for signals
      this.listenForSignals(callId, recipientId, recipientPrivateKey, initiatorPublicKey);
    } catch (error) {
      console.error('Failed to answer call:', error);
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
    return this.remoteStream;
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
    signal: CallSignal
  ): Promise<void> {
    try {
      const encryptedData = encryptMessage(
        signal.data,
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
              const decryptedData = decryptMessage(
                signalData.data,
                userPrivateKey,
                peerPublicKey
              );

              if (signalData.type === 'answer') {
                const answer = JSON.parse(decryptedData);
                await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
              } else if (signalData.type === 'ice-candidate') {
                const candidate = JSON.parse(decryptedData);
                await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
              } else if (signalData.type === 'hangup') {
                this.cleanup();
              }
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

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.signalUnsubscribe) {
      this.signalUnsubscribe();
      this.signalUnsubscribe = null;
    }

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
