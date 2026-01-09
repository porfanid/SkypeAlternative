import { useState, useEffect } from 'react';
import { Friend, FriendRequest } from '@models/index';
import friendService from '@services/friend';
import './FriendList.css';

interface FriendListProps {
  currentUserId: string;
  currentUserPublicKey: string;
  onSelectFriend: (friend: Friend) => void;
}

export const FriendList: React.FC<FriendListProps> = ({
  currentUserId,
  currentUserPublicKey,
  onSelectFriend,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendPublicKey, setNewFriendPublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [currentUserId]);

  const loadFriends = async () => {
    try {
      const friendsList = await friendService.getFriends(currentUserId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await friendService.getPendingRequests(currentUserPublicKey);
      setPendingRequests(requests.filter((r: FriendRequest) => r.status === 'pending'));
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!newFriendPublicKey.trim()) return;

    try {
      // Get username from auth service (need to extract from current user)
      const username = 'User'; // TODO: Get actual username
      
      await friendService.sendFriendRequest(
        newFriendPublicKey.trim(),
        username
      );
      
      alert('Friend request sent!');
      setNewFriendPublicKey('');
      setShowAddFriend(false);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please check the public key.');
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await friendService.acceptFriendRequest(request.id);
      
      await loadFriends();
      await loadPendingRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      await loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request.');
    }
  };

  const handleRemoveFriend = async (friendUserId: string) => {
    if (!window.confirm('Remove this friend?')) return;

    try {
      await friendService.removeFriend(currentUserId, friendUserId);
      await loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend.');
    }
  };

  return (
    <div className="friend-list">
      <div className="friend-list-header">
        <h2>Friends</h2>
        <button 
          className="add-friend-btn"
          onClick={() => setShowAddFriend(!showAddFriend)}
        >
          +
        </button>
      </div>

      {showAddFriend && (
        <div className="add-friend-form">
          <input
            type="text"
            placeholder="Enter friend's public key..."
            value={newFriendPublicKey}
            onChange={(e) => setNewFriendPublicKey(e.target.value)}
            className="friend-key-input"
          />
          <div className="add-friend-actions">
            <button onClick={handleSendFriendRequest} className="btn-primary">
              Send Request
            </button>
            <button onClick={() => setShowAddFriend(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <div className="pending-requests">
          <h3>Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="request-item">
              <div className="request-info">
                <div className="request-avatar">
                  {request.fromUsername[0].toUpperCase()}
                </div>
                <div className="request-details">
                  <span className="request-username">{request.fromUsername}</span>
                  <span className="request-time">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="request-actions">
                <button
                  onClick={() => handleAcceptRequest(request)}
                  className="btn-accept"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  className="btn-reject"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="friends-section">
        {isLoading ? (
          <div className="loading">Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className="empty-state">
            <p>No friends yet. Add some friends to start chatting!</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.userId}
              className="friend-item"
              onClick={() => onSelectFriend(friend)}
            >
              <div className="friend-avatar-large">
                {friend.username[0].toUpperCase()}
              </div>
              <div className="friend-info">
                <span className="friend-username">{friend.username}</span>
                <span className="friend-status-indicator online">●</span>
              </div>
              <button
                className="friend-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFriend(friend.userId);
                }}
                title="Remove friend"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
