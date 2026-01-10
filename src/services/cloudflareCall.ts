/**
 * Cloudflare Calls Client Service
 * 
 * This service manages:
 * - Fetching session credentials from Cloudflare Worker
 * - Publishing and subscribing to media tracks
 * - Managing WebRTC connections through Cloudflare SFU
 */

import { CloudflareSessionCredentials } from '../models';
import { getAuthInstance } from './firebase';

export interface CloudflareCallsConfig {
  workerUrl: string;
}

class CloudflareCallsService {
  private config: CloudflareCallsConfig;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentSessionId: string | null = null;

  constructor() {
    this.config = {
      workerUrl: import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'http://localhost:8787'
    };
  }

  /**
   * Request session credentials from Cloudflare Worker
   */
  async requestSessionCredentials(userId: string): Promise<CloudflareSessionCredentials> {
    try {
      // Get Firebase ID token
      const auth = getAuthInstance();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const idToken = await user.getIdToken();

      // Request session from worker
      const response = await fetch(this.config.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          userId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create session');
      }

      const credentials: CloudflareSessionCredentials = await response.json();
      this.currentSessionId = credentials.sessionId;
      
      return credentials;
    } catch (error) {
      console.error('Failed to request session credentials:', error);
      throw new Error('Failed to request session credentials');
    }
  }

  /**
   * Publish local media stream to Cloudflare
   */
  async publishTrack(
    credentials: CloudflareSessionCredentials,
    localStream: MediaStream
  ): Promise<void> {
    try {
      this.localStream = localStream;

      // Create peer connection with Cloudflare ICE servers
      this.peerConnection = new RTCPeerConnection({
        iceServers: credentials.iceServers
      });

      // Add local tracks
      localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, localStream);
      });

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // ICE candidates are automatically exchanged through the peer connection
          console.log('ICE candidate generated:', event.candidate);
        }
      };

      // Set remote description from Cloudflare
      if (credentials.tracks.sessionDescription) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(credentials.tracks.sessionDescription)
        );
      }

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('Track published successfully');
    } catch (error) {
      console.error('Failed to publish track:', error);
      throw new Error('Failed to publish track');
    }
  }

  /**
   * Subscribe to remote media stream from Cloudflare
   */
  async subscribeToTrack(
    credentials: CloudflareSessionCredentials
  ): Promise<MediaStream> {
    try {
      if (!this.peerConnection) {
        // Create peer connection if not exists
        this.peerConnection = new RTCPeerConnection({
          iceServers: credentials.iceServers
        });
      }

      // Create remote stream
      this.remoteStream = new MediaStream();

      // Handle incoming tracks
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream!.addTrack(track);
        });
      };

      // Set remote description if available
      if (credentials.tracks.sessionDescription) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(credentials.tracks.sessionDescription)
        );
      }

      return this.remoteStream;
    } catch (error) {
      console.error('Failed to subscribe to track:', error);
      throw new Error('Failed to subscribe to track');
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
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.currentSessionId = null;
  }
}

export const cloudflareCallsService = new CloudflareCallsService();
