/**
 * Tests for Notification Service
 */

import { notificationService } from '../../src/services/notification';

// Mock Notification API
const mockNotification = jest.fn();
const mockNotificationInstance = {
  close: jest.fn()
};

Object.defineProperty(global, 'Notification', {
  value: mockNotification,
  writable: true
});

Object.defineProperty(mockNotification, 'permission', {
  value: 'granted',
  writable: true
});

Object.defineProperty(mockNotification, 'requestPermission', {
  value: jest.fn().mockResolvedValue('granted'),
  writable: true
});

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotification.mockReturnValue(mockNotificationInstance);
    (mockNotification as any).permission = 'granted';
  });

  describe('initialize', () => {
    it('should initialize with granted permission', async () => {
      await notificationService.initialize();

      expect((notificationService as any).notificationPermission).toBe('granted');
    });

    it('should request permission when default', async () => {
      (mockNotification as any).permission = 'default';
      (mockNotification.requestPermission as jest.Mock).mockResolvedValue('granted');

      await notificationService.initialize();

      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should handle denied permission', async () => {
      (mockNotification as any).permission = 'denied';

      await notificationService.initialize();

      expect((notificationService as any).notificationPermission).toBe('denied');
    });
  });

  describe('showNotification', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should show notification with title and body', async () => {
      await notificationService.showNotification('Test Title', {
        body: 'Test Body'
      });

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        icon: '/icon.png',
        badge: '/badge.png',
        body: 'Test Body'
      });
    });

    it('should auto-close notification after 5 seconds', async () => {
      jest.useFakeTimers();

      await notificationService.showNotification('Test');

      jest.advanceTimersByTime(5000);

      expect(mockNotificationInstance.close).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should not show notification when permission denied', async () => {
      (notificationService as any).notificationPermission = 'denied';

      await notificationService.showNotification('Test');

      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe('showNewMessageNotification', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should show new message notification', async () => {
      await notificationService.showNewMessageNotification('John Doe', 'Hello!');

      expect(mockNotification).toHaveBeenCalledWith('New Message', {
        icon: '/icon.png',
        badge: '/badge.png',
        body: 'John Doe: Hello!',
        tag: 'new-message'
      });
    });
  });

  describe('showFriendRequestNotification', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should show friend request notification', async () => {
      await notificationService.showFriendRequestNotification('Jane Smith');

      expect(mockNotification).toHaveBeenCalledWith('Friend Request', {
        icon: '/icon.png',
        badge: '/badge.png',
        body: 'Jane Smith sent you a friend request',
        tag: 'friend-request'
      });
    });
  });

  describe('updateBadgeCount', () => {
    it('should set app badge when count > 0', () => {
      const mockSetAppBadge = jest.fn();
      (navigator as any).setAppBadge = mockSetAppBadge;

      notificationService.updateBadgeCount(5);

      expect(mockSetAppBadge).toHaveBeenCalledWith(5);
    });

    it('should clear app badge when count is 0', () => {
      const mockClearAppBadge = jest.fn();
      (navigator as any).clearAppBadge = mockClearAppBadge;

      notificationService.updateBadgeCount(0);

      expect(mockClearAppBadge).toHaveBeenCalled();
    });

    it('should handle missing badge API gracefully', () => {
      delete (navigator as any).setAppBadge;

      expect(() => notificationService.updateBadgeCount(5)).not.toThrow();
    });
  });
});
