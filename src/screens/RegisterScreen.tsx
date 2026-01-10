import React, { useState } from 'react';
import authService from '@services/auth';
import storageService from '@services/storage';
import { generateMnemonic, deriveKeyPairFromMnemonic, validateMnemonic } from '@utils/crypto';
import { User } from '@models/index';
import './RegisterScreen.css';

interface RegisterScreenProps {
  onRegister: (user: User) => void;
  onBackToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onBackToLogin }) => {
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonicGenerated, setMnemonicGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerateMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    setMnemonicGenerated(true);
    setShowMnemonic(true);
    setError('');
    setCopySuccess(false);
  };

  const handleCopyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!mnemonic.trim()) {
      setError('Please generate or enter a mnemonic phrase');
      return;
    }

    if (!validateMnemonic(mnemonic)) {
      setError('Invalid mnemonic phrase');
      return;
    }

    if (!mnemonicConfirmed) {
      setError('Please confirm you have saved your mnemonic phrase');
      return;
    }

    setIsLoading(true);

    try {
      // Derive key pair from mnemonic
      const keyPair = deriveKeyPairFromMnemonic(mnemonic);

      // Register user
      const user = await authService.register(keyPair.publicKey, username);

      // Store key pair securely
      await storageService.storeKeyPair({
        ...keyPair,
        mnemonic,
      });

      onRegister(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-container">
        <h1>Create Account</h1>
        <p className="subtitle">Secure end-to-end encrypted chat</p>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Recovery Phrase</label>
          <button
            className="button"
            onClick={handleGenerateMnemonic}
            disabled={mnemonicGenerated || isLoading}
          >
            {mnemonicGenerated ? 'Recovery Phrase Generated' : 'Generate Recovery Phrase'}
          </button>
        </div>

        {mnemonicGenerated && (
          <>
            <div className="mnemonic-container">
              <div className="mnemonic-display">
                {showMnemonic ? (
                  <div className="mnemonic-words">
                    {mnemonic.split(' ').map((word, index) => (
                      <span key={index} className="mnemonic-word">
                        {index + 1}. {word}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mnemonic-hidden">
                    ••••••••••••••••••••••••••••
                  </div>
                )}
              </div>
              <div className="button-group">
                <button
                  className="button secondary"
                  onClick={() => setShowMnemonic(!showMnemonic)}
                >
                  {showMnemonic ? 'Hide' : 'Show'} Recovery Phrase
                </button>
                <button
                  className="button secondary"
                  onClick={handleCopyMnemonic}
                  disabled={!showMnemonic}
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="warning-box">
              <strong>⚠️ Important:</strong>
              <p>
                Save your recovery phrase in a secure location. You will need it to recover
                your account. We cannot recover it for you if you lose it.
              </p>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="confirm-mnemonic"
                checked={mnemonicConfirmed}
                onChange={(e) => setMnemonicConfirmed(e.target.checked)}
              />
              <label htmlFor="confirm-mnemonic">
                I have securely saved my recovery phrase
              </label>
            </div>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button
            className="button"
            onClick={handleRegister}
            disabled={isLoading || !mnemonicGenerated}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button
            className="button secondary"
            onClick={onBackToLogin}
            disabled={isLoading}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
