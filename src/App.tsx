import React, { useState, useEffect } from 'react';
import authService from '@services/auth';
import storageService from '@services/storage';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MainApp from '@screens/MainApp';
import { User } from '@types/index';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'login' | 'register' | 'main'>('login');

  useEffect(() => {
    // Try to load stored user on app start
    const loadUser = async () => {
      try {
        const storedUser = await authService.loadStoredUser();
        if (storedUser) {
          setCurrentUser(storedUser);
          setScreen('main');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setScreen('main');
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setScreen('main');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setScreen('login');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (screen === 'main' && currentUser) {
    return <MainApp user={currentUser} onLogout={handleLogout} />;
  }

  if (screen === 'register') {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onBackToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onGoToRegister={() => setScreen('register')}
    />
  );
}

export default App;
