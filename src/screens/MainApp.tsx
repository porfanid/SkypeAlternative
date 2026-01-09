import React, { useState, useEffect } from 'react';
import { User, Friend } from '@models/index';
import { ChatWindow } from '../components/ChatWindow';
import { FriendList } from '../components/FriendList';
import { CallScreen } from './CallScreen';
import { callService } from '../services/call';
import { notificationService } from '../services/notification';
import './MainApp.css';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerPublicKey: string;
  isVideoEnabled: boolean;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'settings'>('chats');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [inCall, setInCall] = useState(false);
  const [callData, setCallData] = useState<{
    callId: string;
    isInitiator: boolean;
    peerId: string;
    peerName: string;
    peerPublicKey: string;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Listen for incoming calls
    const unsubscribe = callService.listenForIncomingCalls(user.id, (call) => {
      // Show incoming call UI
      setIncomingCall({
        callId: call.callId,
        callerId: call.initiatorId,
        callerName: 'Unknown', // Would fetch from friend list
        callerPublicKey: '', // Would fetch from friend list
        isVideoEnabled: call.isVideoEnabled
      });

      // Show notification
      notificationService.showIncomingCallNotification(
        'Unknown',
        () => handleAnswerCall(call.callId),
        () => handleRejectCall(call.callId)
      );
    });

    return () => {
      unsubscribe();
    };
  }, [user.id]);

  const handleStartCall = (friend: Friend, videoEnabled: boolean) => {
    setCallData({
      callId: `call_${Date.now()}`,
      isInitiator: true,
      peerId: friend.userId,
      peerName: friend.username,
      peerPublicKey: friend.publicKey
    });
    setInCall(true);
  };

  const handleAnswerCall = async (callId: string) => {
    if (!incomingCall) return;

    setCallData({
      callId,
      isInitiator: false,
      peerId: incomingCall.callerId,
      peerName: incomingCall.callerName,
      peerPublicKey: incomingCall.callerPublicKey
    });
    setInCall(true);
    setIncomingCall(null);
  };

  const handleRejectCall = async (callId: string) => {
    await callService.rejectCall(callId);
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    setInCall(false);
    setCallData(null);
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setActiveTab('chats');
  };

  return (
    <div className="main-app">
      {inCall && callData ? (
        <CallScreen
          callId={callData.callId}
          isInitiator={callData.isInitiator}
          peerId={callData.peerId}
          peerName={callData.peerName}
          peerPublicKey={callData.peerPublicKey}
          userPrivateKey={user.publicKey} // This should be private key from storage
          onClose={handleEndCall}
        />
      ) : (
        <>
          <div className="sidebar">
            <div className="sidebar-header">
              <div className="app-title">
                <span className="logo-icon">🔒</span>
                <span>SkypeAlternative</span>
              </div>
            </div>

            <div className="user-info">
              <div className="user-avatar">{user.username[0].toUpperCase()}</div>
              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="user-id" title={user.publicKey}>
                  ID: {user.id.substring(0, 8)}...
                </div>
              </div>
            </div>

            <nav className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'chats' ? 'active' : ''}`}
                onClick={() => setActiveTab('chats')}
              >
                💬 Chats
              </button>
              <button
                className={`nav-tab ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                👥 Friends
              </button>
              <button
                className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </nav>

            <div className="sidebar-footer">
              <button className="logout-button" onClick={onLogout}>
                🚪 Logout
              </button>
            </div>
          </div>

          <div className="main-content">
            {activeTab === 'chats' && (
              selectedFriend ? (
                <ChatWindow
                  friend={selectedFriend}
                  currentUserId={user.id}
                  onClose={() => setSelectedFriend(null)}
                  onStartCall={(videoEnabled) => handleStartCall(selectedFriend, videoEnabled)}
                />
              ) : (
                <div className="content-placeholder">
                  <div className="placeholder-icon">💬</div>
                  <h2>Chats</h2>
                  <p>Select a friend to start chatting</p>
                  <p className="info-text">
                    All messages are end-to-end encrypted
                  </p>
                </div>
              )
            )}

            {activeTab === 'friends' && (
              <FriendList
                currentUserId={user.id}
                onSelectFriend={handleSelectFriend}
              />
            )}

            {activeTab === 'settings' && (
              <div className="content-placeholder">
                <div className="placeholder-icon">⚙️</div>
                <h2>Settings</h2>
                <div className="settings-info">
                  <div className="setting-item">
                    <strong>Username:</strong> {user.username}
                  </div>
                  <div className="setting-item">
                    <strong>User ID:</strong> {user.id}
                  </div>
                  <div className="setting-item">
                    <strong>Public Key:</strong>
                    <div className="public-key">{user.publicKey}</div>
                  </div>
                  <div className="setting-item">
                    <strong>Account Created:</strong>{' '}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {incomingCall && (
            <div className="incoming-call-modal">
              <div className="incoming-call-content">
                <h3>Incoming Call</h3>
                <p>{incomingCall.callerName} is calling...</p>
                <p>{incomingCall.isVideoEnabled ? '📹 Video Call' : '🎤 Voice Call'}</p>
                <div className="incoming-call-actions">
                  <button
                    className="answer-btn"
                    onClick={() => handleAnswerCall(incomingCall.callId)}
                  >
                    ✅ Answer
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleRejectCall(incomingCall.callId)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainApp;
