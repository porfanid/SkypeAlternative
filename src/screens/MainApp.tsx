import React, { useState } from 'react';
import { User } from '@models/index';
import './MainApp.css';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'settings'>('chats');

  return (
    <div className="main-app">
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
          <div className="content-placeholder">
            <div className="placeholder-icon">💬</div>
            <h2>Chats</h2>
            <p>Your encrypted conversations will appear here</p>
            <p className="info-text">
              Chat functionality coming soon. Messages will be end-to-end encrypted.
            </p>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="content-placeholder">
            <div className="placeholder-icon">👥</div>
            <h2>Friends</h2>
            <p>Manage your contacts and friend requests</p>
            <p className="info-text">
              Friend management coming soon. Add friends using their public keys.
            </p>
          </div>
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
    </div>
  );
};

export default MainApp;
