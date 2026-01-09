import React, { useState } from 'react';
import authService from '@services/auth';
import storageService from '@services/storage';
import { deriveKeyPairFromMnemonic, validateMnemonic } from '@utils/crypto';
import { User } from '@models/index';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onGoToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister }) => {
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!mnemonic.trim()) {
      setError('Please enter your recovery phrase');
      return;
    }

    if (!validateMnemonic(mnemonic)) {
      setError('Invalid recovery phrase');
      return;
    }

    setIsLoading(true);

    try {
      // Derive key pair from mnemonic
      const keyPair = deriveKeyPairFromMnemonic(mnemonic);

      // Login
      const user = await authService.login(keyPair.publicKey, keyPair.privateKey);

      // Store key pair securely
      await storageService.storeKeyPair({
        ...keyPair,
        mnemonic,
      });

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your recovery phrase.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="logo">
          <div className="logo-icon">🔒</div>
          <h1>SkypeAlternative</h1>
        </div>
        
        <p className="tagline">Secure End-to-End Encrypted Communication</p>

        <div className="form-group">
          <label>Recovery Phrase</label>
          <div className="input-wrapper">
            <textarea
              className="input mnemonic-input"
              placeholder="Enter your 12-word recovery phrase"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows={3}
              style={{ fontFamily: showMnemonic ? 'inherit' : 'monospace' }}
            />
          </div>
          <div className="input-helper">
            <button
              className="text-button"
              onClick={() => setShowMnemonic(!showMnemonic)}
              type="button"
            >
              {showMnemonic ? '🙈 Hide' : '👁️ Show'} phrase
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="button login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="button secondary"
          onClick={onGoToRegister}
          disabled={isLoading}
        >
          Create New Account
        </button>

        <div className="info-box">
          <p>
            <strong>About Your Recovery Phrase:</strong>
          </p>
          <p>
            Your recovery phrase is the only way to access your account. 
            Keep it safe and never share it with anyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
