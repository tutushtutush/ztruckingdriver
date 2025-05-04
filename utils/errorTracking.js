import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorTrackingApi } from '../api/errorTracking';

const FAILED_ERRORS_KEY = '@failed_errors';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_STORED_ERRORS = 100; // Maximum number of errors to store locally

// Singleton instance
let errorApi = null;
let retryTimer = null;
let userContext = null;

// Initialize the error tracking utility
export const initializeErrorTracking = (httpClient, baseApiUrl) => {
  errorApi = new ErrorTrackingApi(httpClient, baseApiUrl);
  startRetryTimer();
};

// Start the retry timer
const startRetryTimer = () => {
  if (retryTimer) {
    clearInterval(retryTimer);
  }

  retryTimer = setInterval(async () => {
    await retryFailedErrors();
  }, RETRY_INTERVAL);
};

// Retry failed errors
const retryFailedErrors = async () => {
  try {
    const failedErrors = await getFailedErrors();
    if (!failedErrors || failedErrors.length === 0) return;

    const stillFailed = [];

    for (const error of failedErrors) {
      const result = await errorApi.logError(error);
      if (!result.success && error.retryCount < MAX_RETRY_ATTEMPTS) {
        error.retryCount = (error.retryCount || 0) + 1;
        stillFailed.push(error);
      }
    }

    await saveFailedErrors(stillFailed);
  } catch (error) {
    // Silently fail - we'll try again next interval
  }
};

// Get failed errors from storage
const getFailedErrors = async () => {
  try {
    const errors = await AsyncStorage.getItem(FAILED_ERRORS_KEY);
    return errors ? JSON.parse(errors) : [];
  } catch (error) {
    return [];
  }
};

// Save failed errors to storage
const saveFailedErrors = async (errors) => {
  try {
    // Keep only the most recent errors
    const errorsToStore = errors.slice(-MAX_STORED_ERRORS);
    await AsyncStorage.setItem(FAILED_ERRORS_KEY, JSON.stringify(errorsToStore));
  } catch (error) {
    // Silently fail - we'll try again next interval
  }
};

// Track error with context
export const trackError = async (error, context = {}) => {
  if (!errorApi) {
    return;
  }

  try {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      isEmulator: Platform.isTesting,
      timestamp: new Date().toISOString(),
    };

    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        ...context,
        ...deviceInfo,
        user: userContext,
      },
      retryCount: 0,
    };

    const result = await errorApi.logError(errorData);

    if (!result.success) {
      const failedErrors = await getFailedErrors();
      failedErrors.push(errorData);
      await saveFailedErrors(failedErrors);
    }

    if (__DEV__) {
      console.log('Error tracked:', {
        message: errorData.error.message,
        context: errorData.context,
        timestamp: errorData.timestamp
      });
    }
  } catch (trackingError) {
    // Silently fail - we'll try again next interval
  }
};

// Track API errors
export const trackApiError = async (error, endpoint, requestData = {}) => {
  await trackError(error, {
    type: 'api_error',
    endpoint,
    requestData,
    status: error.response?.status,
    responseData: error.response?.data,
  });
};

// Track user interaction errors
export const trackUserError = async (error, userAction, screen) => {
  await trackError(error, {
    type: 'user_error',
    userAction,
    screen,
  });
};

// Set user context
export const setUserContext = (userId, email) => {
  userContext = {
    id: userId,
    email: email,
  };
};

// Clear user context
export const clearUserContext = () => {
  userContext = null;
};

// Cleanup
export const cleanupErrorTracking = () => {
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}; 