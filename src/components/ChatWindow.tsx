import { useState, useEffect, useRef } from 'react';
import { Friend, Message } from '@models/index';
import messageService from '@services/message';
import storageService from '@services/storage';
import './ChatWindow.css';

interface ChatWindowProps {
  friend: Friend;
  currentUserId: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ friend, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Set up real-time listener
    const unsubscribe = messageService.listenForMessages(currentUserId, (newMessages) => {
      const friendMessages = newMessages.filter(
        m => m.senderId === friend.userId || m.recipientId === friend.userId
      );
      if (friendMessages.length > 0) {
        loadMessages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [friend.userId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const loadedMessages = await messageService.getMessages(
        currentUserId,
        friend.userId,
        100
      );
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const keyPair = await storageService.getKeyPair();
      if (!keyPair) {
        throw new Error('No key pair found');
      }

      await messageService.sendMessage(
        friend.userId,
        friend.publicKey,
        newMessage.trim(),
        keyPair.privateKey,
        currentUserId
      );

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="friend-avatar">{friend.username[0].toUpperCase()}</div>
          <div className="friend-details">
            <h3>{friend.username}</h3>
            <span className="friend-status">Online</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`message ${isOwn ? 'own-message' : 'friend-message'}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-meta">
                  <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                  {isOwn && (
                    <span className="message-status">
                      {message.status === 'sending' ? '⏳' : 
                       message.status === 'sent' ? '✓' : 
                       message.status === 'delivered' ? '✓✓' : 
                       message.status === 'read' ? '✓✓' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
};
