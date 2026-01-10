import React, { useState, useEffect, useRef } from 'react';
import { callService } from '../services/call';
import './CallScreen.css';

interface CallScreenProps {
  callId: string;
  isInitiator: boolean;
  peerId: string;
  peerName: string;
  peerPublicKey: string;
  userPrivateKey: string;
  onClose: () => void;
}

export const CallScreen: React.FC<CallScreenProps> = ({
  callId,
  isInitiator,
  peerId,
  peerName,
  peerPublicKey,
  userPrivateKey,
  onClose
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'in-progress' | 'ended'>('connecting');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      if (isInitiator) {
        // Initiator starts the call
        setCallStatus('ringing');
        await callService.initiateCall(
          peerId,
          peerPublicKey,
          userPrivateKey,
          { video: isVideoEnabled, audio: isAudioEnabled }
        );
      } else {
        // Recipient answers the call
        await callService.answerCall(
          callId,
          peerPublicKey,
          userPrivateKey,
          { video: isVideoEnabled, audio: isAudioEnabled }
        );
        setCallStatus('in-progress');
        startDurationTimer();
      }

      // Set up video streams
      setupVideoStreams();
    } catch (err) {
      console.error('Failed to initialize call:', err);
      setError('Failed to initialize call. Please check your camera and microphone permissions.');
    }
  };

  const setupVideoStreams = () => {
    const localStream = callService.getLocalStream();
    const remoteStream = callService.getRemoteStream();

    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    // Poll for remote stream (it may not be available immediately)
    const checkRemoteStream = setInterval(() => {
      const stream = callService.getRemoteStream();
      if (stream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setCallStatus('in-progress');
        startDurationTimer();
        clearInterval(checkRemoteStream);
      }
    }, 500);

    // Clear interval after 30 seconds
    setTimeout(() => clearInterval(checkRemoteStream), 30000);
  };

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    callService.toggleVideo(newState);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    callService.toggleAudio(newState);
  };

  const endCall = async () => {
    try {
      await callService.endCall(callId);
      setCallStatus('ended');
      cleanup();
      onClose();
    } catch (err) {
      console.error('Failed to end call:', err);
      cleanup();
      onClose();
    }
  };

  const cleanup = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-screen">
      <div className="call-header">
        <div className="call-info">
          <h2>{peerName}</h2>
          <div className="call-status">
            {callStatus === 'connecting' && <span>Connecting...</span>}
            {callStatus === 'ringing' && <span>Ringing...</span>}
            {callStatus === 'in-progress' && <span>{formatDuration(duration)}</span>}
            {callStatus === 'ended' && <span>Call Ended</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="call-error">
          <p>{error}</p>
        </div>
      )}

      <div className="video-container">
        <video
          ref={remoteVideoRef}
          className="remote-video"
          autoPlay
          playsInline
        />
        <video
          ref={localVideoRef}
          className="local-video"
          autoPlay
          playsInline
          muted
        />
      </div>

      <div className="call-controls">
        <button
          className={`control-btn ${isVideoEnabled ? 'active' : 'inactive'}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? '📹' : '📹❌'}
        </button>

        <button
          className={`control-btn ${isAudioEnabled ? 'active' : 'inactive'}`}
          onClick={toggleAudio}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? '🎤' : '🎤❌'}
        </button>

        <button
          className="control-btn end-call-btn"
          onClick={endCall}
          title="End call"
        >
          📞❌
        </button>
      </div>
    </div>
  );
};
