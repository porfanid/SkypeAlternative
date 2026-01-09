import { useState, useEffect, useRef } from 'react';
import { Friend, Message } from '@models/index';
import messageService from '@services/message';
import enhancedMessageService from '@services/enhancedMessage';
import storageService from '@services/storage';
import { decryptMessage } from '@utils/crypto';
import './ChatWindow.css';

interface ChatWindowProps {
  friend: Friend;
  currentUserId: string;
  onClose: () => void;
  onStartCall?: (videoEnabled: boolean) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  friend, 
  currentUserId, 
  onClose,
  onStartCall 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load private key once
    storageService.getKeyPair().then(kp => {
      if (kp) setPrivateKey(kp.privateKey);
    });
    
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
      setMessages(loadedMessages.filter(m => !m.deletedAt && (!m.expiresAt || m.expiresAt > Date.now())));
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

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await enhancedMessageService.addReaction(messageId, emoji, currentUserId);
      await loadMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await enhancedMessageService.deleteMessage(messageId, currentUserId);
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
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

  const decryptAndRenderMessage = (message: Message): string => {
    try {
      if (!privateKey) return '[Key loading...]';

      const senderPublicKey = message.senderId === currentUserId 
        ? friend.publicKey 
        : friend.publicKey;

      const encryptedMsg = JSON.parse(message.encryptedContent);
      return decryptMessage(encryptedMsg, privateKey, senderPublicKey);
    } catch (error) {
      console.error('Decryption error:', error);
      return '[Unable to decrypt]';
    }
  };

  const filteredMessages = searchTerm 
    ? messages.filter(m => {
        const content = decryptAndRenderMessage(m);
        return content.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : messages;

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
        <div className="chat-header-actions">
          {onStartCall && (
            <>
              <button
                className="call-btn"
                onClick={() => onStartCall(false)}
                title="Voice call"
              >
                📞
              </button>
              <button
                className="call-btn"
                onClick={() => onStartCall(true)}
                title="Video call"
              >
                📹
              </button>
            </>
          )}
          <input
            type="text"
            className="search-input"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <p>{searchTerm ? 'No messages found' : 'No messages yet. Start the conversation!'}</p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const content = decryptAndRenderMessage(message);
            
            return (
              <div
                key={message.id}
                className={`message ${isOwn ? 'own-message' : 'friend-message'}`}
              >
                <div className="message-content">
                  {content}
                  {message.editedAt && <span className="edited-label">(edited)</span>}
                </div>
                <div className="message-reactions">
                  {message.reactions?.map((reaction, idx) => (
                    <span key={idx} className="reaction">
                      {reaction.emoji}
                    </span>
                  ))}
                  <button 
                    className="add-reaction-btn"
                    onClick={() => handleAddReaction(message.id, '👍')}
                    title="Add reaction"
                  >
                    +
                  </button>
                </div>
                <div className="message-meta">
                  <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                  {isOwn && (
                    <>
                      <span className="message-status">
                        {message.status === 'sending' ? '⏳' : 
                         message.status === 'sent' ? '✓' : 
                         message.status === 'delivered' ? '✓✓' : 
                         message.status === 'read' ? '✓✓' : ''}
                      </span>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteMessage(message.id)}
                        title="Delete message"
                      >
                        🗑️
                      </button>
                    </>
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
