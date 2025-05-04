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

    it('should track error with device info and context', async () => {
      const context = { customField: 'test' };
      mockLogError.mockResolvedValue({ success: true });

      await trackError(mockError, context);

      expect(mockLogError).toHaveBeenCalledWith({
        error: {
          message: 'Test error',
          stack: 'Error stack',
          name: 'Error',
        },
        context: {
          customField: 'test',
          platform: 'ios',
          version: '15.0',
          isEmulator: true,
          timestamp: expect.any(String),
          user: null,
        },
        retryCount: 0,
      });
    });

    it('should store failed errors in AsyncStorage when API call fails', async () => {
      mockLogError.mockResolvedValue({ success: false });
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      await trackError(mockError);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@failed_errors',
        expect.any(String)
      );
    });

    it('should handle errors silently when AsyncStorage fails', async () => {
      mockLogError.mockResolvedValue({ success: false });
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(trackError(mockError)).resolves.not.toThrow();
    });
  });

  describe('trackApiError', () => {
    beforeEach(() => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
    });

    it('should track API error with endpoint and request data', async () => {
      mockLogError.mockResolvedValue({ success: true });
      const endpoint = '/api/test';
      const requestData = { param: 'value' };

      await trackApiError(mockError, endpoint, requestData);

      expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
        context: expect.objectContaining({
          type: 'api_error',
          endpoint,
          requestData,
        }),
      }));
    });
  });

  describe('trackUserError', () => {
    beforeEach(() => {
      initializeErrorTracking(mockHttpClient, baseApiUrl);
    });

    it('should track user error with action and screen', async () => {
      mockLogError.mockResolvedValue({ success: true });
      const userAction = 'button_click';
      const screen = 'HomeScreen';

      await trackUserError(mockError, userAction, screen);

      expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
        context: expect.objectContaining({
          type: 'user_error',
          userAction,
          screen,
        }),
      }));
    });
  });

  describe('user context', () => {
    it('should include user context in tracked errors', async () => {
      const userId = '123';
      const email = 'test@example.com';
      
      // Set user context
      setUserContext(userId, email);
      
      // Track an error
      mockLogError.mockResolvedValue({ success: true });
      await trackError(mockError);
      
      // Verify user context is included
      expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
        context: expect.objectContaining({
          user: {
            id: userId,
            email: email,
          },
        }),
      }));

      // Clear user context
      clearUserContext();
      
      // Track another error
      mockLogError.mockClear();
      await trackError(mockError);
      
      // Verify user context is cleared
      expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({
        context: expect.objectContaining({
          user: null,
        }),
      }));
    });
  });

  describe('cleanup', () => {
    it('should stop retrying failed errors after cleanup', async () => {
      // Initialize error tracking
      initializeErrorTracking(mockHttpClient, baseApiUrl);
      
      // Setup failed error scenario
      mockLogError.mockResolvedValue({ success: false });
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ error: 'test' }]));

      // Track an error to populate failed errors
      await trackError(mockError);

      // Clear mock calls before cleanup
      mockLogError.mockClear();
      AsyncStorage.getItem.mockClear();

      // Cleanup
      cleanupErrorTracking();

      // Advance timers
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Verify no retry attempts were made
      expect(mockLogError).not.toHaveBeenCalled();
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });
  });
}); 