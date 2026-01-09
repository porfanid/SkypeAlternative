/**
 * Notification Service - Cross-platform notifications
 * 
 * Handles:
 * - Desktop notifications (Electron)
 * - System tray notifications
 * - Sound notifications
 * - Badge counts
 */

class NotificationService {
  private notificationPermission: NotificationPermission = 'default';

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        this.notificationPermission = await Notification.requestPermission();
      }
    }
  }

  /**
   * Show notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Show incoming call notification
   */
  async showIncomingCallNotification(callerName: string, onAnswer: () => void, onReject: () => void): Promise<void> {
    await this.showNotification('Incoming Call', {
      body: `${callerName} is calling you...`,
      tag: 'incoming-call',
      requireInteraction: true,
      actions: [
        { action: 'answer', title: 'Answer' },
        { action: 'reject', title: 'Reject' }
      ]
    });

    // Play ringtone
    this.playRingtone();
  }

  /**
   * Show new message notification
   */
  async showNewMessageNotification(senderName: string, messagePreview: string): Promise<void> {
    await this.showNotification('New Message', {
      body: `${senderName}: ${messagePreview}`,
      tag: 'new-message'
    });

    // Play notification sound
    this.playNotificationSound();
  }

  /**
   * Show friend request notification
   */
  async showFriendRequestNotification(requesterName: string): Promise<void> {
    await this.showNotification('Friend Request', {
      body: `${requesterName} sent you a friend request`,
      tag: 'friend-request'
    });

    this.playNotificationSound();
  }

  /**
   * Play ringtone
   */
  private playRingtone(): void {
    try {
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      audio.play();
    } catch (error) {
      console.error('Failed to play ringtone:', error);
    }
  }

  /**
   * Stop ringtone
   */
  stopRingtone(): void {
    // Implementation depends on how ringtone is managed
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  /**
   * Update badge count (for taskbar/dock)
   */
  updateBadgeCount(count: number): void {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    if ('getNotifications' in Notification) {
      (Notification as any).getNotifications().then((notifications: Notification[]) => {
        notifications.forEach(notification => notification.close());
      });
    }
  }
}

export const notificationService = new NotificationService();
