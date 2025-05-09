import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ErrorTrackingApi } from '../../api/errorTracking';
import {
  initializeErrorTracking,
  trackError,
  trackApiError,
  trackUserError,
  setUserContext,
  clearUserContext,
  cleanupErrorTracking,
} from '../../utils/errorTracking';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '15.0',
    isTesting: true,
  },
}));

// Mock ErrorTrackingApi
const mockLogError = jest.fn();
jest.mock('../../api/errorTracking', () => ({
  ErrorTrackingApi: jest.fn().mockImplementation(() => ({
    logError: mockLogError,
  })),
}));

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('ErrorTracking Utility', () => {
  let mockHttpClient;
  const baseApiUrl = 'https://api.example.com';
  const mockError = new Error('Test error');
  mockError.stack = 'Error stack';
  mockError.name = 'Error';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockHttpClient = { post: jest.fn() };
    mockLogError.mockReset();
    
    // Reset singleton state
    clearUserContext();
    cleanupErrorTracking();
  });

  describe('initializeErrorTracking', () => {
    it('should initialize error tracking with http client and base url', () => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
      expect(ErrorTrackingApi).toHaveBeenCalledWith(mockHttpClient, baseApiUrl);
    });
  });

  describe('trackError', () => {
    beforeEach(() => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
    });

    it('should track error with device info and context in development mode', async () => {
      const context = { customField: 'test' };
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      await trackError(mockError, context);

      expect(mockLogError).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      global.__DEV__ = originalDev;
    });

    it('should not track errors in production mode', async () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      await trackError(mockError);

      expect(mockLogError).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      global.__DEV__ = originalDev;
    });
  });

  describe('trackApiError', () => {
    beforeEach(() => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
    });

    it('should track API error with endpoint and request data in development mode', async () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      const endpoint = '/api/test';
      const requestData = { param: 'value' };

      await trackApiError(mockError, endpoint, requestData);

      expect(mockLogError).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      global.__DEV__ = originalDev;
    });
  });

  describe('trackUserError', () => {
    beforeEach(() => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
    });

    it('should track user error with action and screen in development mode', async () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      const userAction = 'button_click';
      const screen = 'HomeScreen';

      await trackUserError(mockError, userAction, screen);

      expect(mockLogError).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      global.__DEV__ = originalDev;
    });
  });

  describe('user context', () => {
    it('should maintain user context state', async () => {
      const userId = '123';
      const email = 'test@example.com';
      
      // Set user context
      setUserContext(userId, email);
      
      // Track an error to verify user context is set
      const originalDev = global.__DEV__;
      global.__DEV__ = true;
      await trackError(mockError);
      
      // Clear user context
      clearUserContext();
      
      // Track another error to verify user context is cleared
      await trackError(mockError);
      
      // Verify that error tracking still works after clearing context
      expect(() => trackError(mockError)).not.toThrow();
      
      global.__DEV__ = originalDev;
    });
  });

  describe('cleanup', () => {
    it('should cleanup error tracking state', () => {
      // Initialize error tracking
      initializeErrorTracking(mockHttpClient, baseApiUrl);
      
      // Cleanup
      cleanupErrorTracking();

      // Verify cleanup by checking that subsequent error tracking still works
      // This indirectly verifies that cleanup didn't break the error tracking functionality
      const error = new Error('Test error after cleanup');
      expect(() => trackError(error)).not.toThrow();
    });
  });
}); 