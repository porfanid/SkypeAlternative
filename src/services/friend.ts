import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseService } from './firebase';
import { Friend, FriendRequest } from '@models/index';
import authService from './auth';

class FriendService {
  private static instance: FriendService;

  private constructor() {}

  static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  /**
   * Send a friend request using public key
   */
  async sendFriendRequest(
    toPublicKey: string,
    fromUsername: string
  ): Promise<FriendRequest> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const currentUser = authService.getCurrentUser();

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Find recipient user
      const recipient = await authService.findUserByPublicKey(toPublicKey);
      if (!recipient) {
        throw new Error('User not found with this public key');
      }

      // Check if already friends
      const existingFriend = await this.getFriend(currentUser.id, recipient.id);
      if (existingFriend) {
        throw new Error('Already friends with this user');
      }

      // Check for existing pending request
      const existingRequest = await this.getPendingRequest(currentUser.id, recipient.id);
      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Create friend request
      const requestId = `${currentUser.id}_${recipient.id}_${Date.now()}`;
      const friendRequest: FriendRequest = {
        id: requestId,
        fromUserId: currentUser.id,
        fromPublicKey: currentUser.publicKey,
        fromUsername: fromUsername,
        toPublicKey: toPublicKey,
        status: 'pending',
        createdAt: Date.now(),
      };

      const requestRef = doc(db, 'friendRequests', requestId);
      await setDoc(requestRef, {
        ...friendRequest,
        createdAt: Timestamp.fromMillis(friendRequest.createdAt),
      });

      return friendRequest;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const currentUser = authService.getCurrentUser();

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get the request
      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const request = requestDoc.data() as FriendRequest;

      // Verify the request is for this user
      if (request.toPublicKey !== currentUser.publicKey) {
        throw new Error('This friend request is not for you');
      }

      // Get requester details
      const requester = await authService.findUserByPublicKey(request.fromPublicKey);
      if (!requester) {
        throw new Error('Requester user not found');
      }

      // Add to both users' friend lists
      const friend1Ref = doc(db, 'friends', `${currentUser.id}_${requester.id}`);
      const friend2Ref = doc(db, 'friends', `${requester.id}_${currentUser.id}`);

      await Promise.all([
        setDoc(friend1Ref, {
          userId: requester.id,
          publicKey: requester.publicKey,
          username: requester.username,
          addedAt: Timestamp.now(),
        }),
        setDoc(friend2Ref, {
          userId: currentUser.id,
          publicKey: currentUser.publicKey,
          username: currentUser.username,
          addedAt: Timestamp.now(),
        }),
      ]);

      // Update request status
      await setDoc(requestRef, {
        ...request,
        status: 'accepted',
        createdAt: Timestamp.fromMillis(request.createdAt),
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Reject a friend request
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();
      const currentUser = authService.getCurrentUser();

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const requestRef = doc(db, 'friendRequests', requestId);
      const requestDoc = await getDoc(requestRef);

      if (!requestDoc.exists()) {
        throw new Error('Friend request not found');
      }

      const request = requestDoc.data() as FriendRequest;

      // Verify the request is for this user
      if (request.toPublicKey !== currentUser.publicKey) {
        throw new Error('This friend request is not for you');
      }

      // Update request status
      await setDoc(requestRef, {
        ...request,
        status: 'rejected',
        createdAt: Timestamp.fromMillis(request.createdAt),
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  /**
   * Get all friends for current user
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const friendsRef = collection(db, 'friends');
      const q = query(friendsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const friends: Friend[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        friends.push({
          userId: data.userId,
          publicKey: data.publicKey,
          username: data.username,
          addedAt: data.addedAt.toMillis(),
        });
      });

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(publicKey: string): Promise<FriendRequest[]> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('toPublicKey', '==', publicKey),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      const requests: FriendRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          fromUserId: data.fromUserId,
          fromPublicKey: data.fromPublicKey,
          fromUsername: data.fromUsername,
          toPublicKey: data.toPublicKey,
          status: data.status,
          createdAt: data.createdAt.toMillis(),
        });
      });

      return requests;
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const friend1Ref = doc(db, 'friends', `${userId}_${friendId}`);
      const friend2Ref = doc(db, 'friends', `${friendId}_${userId}`);

      await Promise.all([deleteDoc(friend1Ref), deleteDoc(friend2Ref)]);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Check if users are friends
   */
  private async getFriend(userId: string, friendId: string): Promise<Friend | null> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const friendRef = doc(db, 'friends', `${userId}_${friendId}`);
      const friendDoc = await getDoc(friendRef);

      if (!friendDoc.exists()) {
        return null;
      }

      const data = friendDoc.data();
      return {
        userId: data.userId,
        publicKey: data.publicKey,
        username: data.username,
        addedAt: data.addedAt.toMillis(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Check for pending request
   */
  private async getPendingRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<FriendRequest | null> {
    try {
      const firebase = getFirebaseService();
      const db = firebase.getFirestore();

      const requestsRef = collection(db, 'friendRequests');
      const q = query(
        requestsRef,
        where('fromUserId', '==', fromUserId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const data = querySnapshot.docs[0].data();
      return {
        id: querySnapshot.docs[0].id,
        fromUserId: data.fromUserId,
        fromPublicKey: data.fromPublicKey,
        fromUsername: data.fromUsername,
        toPublicKey: data.toPublicKey,
        status: data.status,
        createdAt: data.createdAt.toMillis(),
      };
    } catch (error) {
      return null;
    }
  }
}

export default FriendService.getInstance();
