import { errorHandler } from '../services/errorHandler';

/**
 * Initialize the error service with an optional remote service URL
 * @param {string} [remoteServiceUrl] - Optional URL for the remote error reporting service
 */
export const initializeErrorService = (remoteServiceUrl) => {
  errorHandler.initialize(remoteServiceUrl);
};

/**
 * Log an error with optional context information
 * @param {Error|string} error - The error object or error message to log
 * @param {Object} context - Additional context for the error
 * @param {string} [context.userId] - Optional user ID associated with the error
 * @param {string} [context.screenName] - Optional screen name where the error occurred
 * @param {string} [context.action] - Optional action being performed when the error occurred
 * @param {Object} [context.additionalData] - Optional additional data to include with the error
 * @returns {Promise<void>}
 */
export const logError = async (error, context = {}) => {
  if (!errorHandler.isInitialized) {
    console.warn('ErrorHandler not initialized. Call initializeErrorService() first.');
    return;
  }

  if (typeof error === 'string') {
    await errorHandler.captureErrorWithMessage(error, context);
  } else {
    await errorHandler.captureError(error, context);
  }
};

/**
 * Utility function to wrap async functions with error handling
 * @param {Function} fn - The async function to wrap
 * @param {Object} context - Additional context for error handling
 * @param {string} [context.screenName] - Optional screen name where the function is being called
 * @param {string} [context.action] - Optional action being performed
 * @param {Object} [context.additionalData] - Optional additional data to include with any errors
 * @returns {Promise<*>} - Returns whatever the wrapped function returns
 * @throws {Error} - Re-throws any caught errors after logging them
 */
export const withErrorHandling = async (fn, context = {}) => {
  try {
    return await fn();
  } catch (error) {
    await logError(error, context);
    
    // Transform the error into a more user-friendly format
    let userFriendlyError = new Error('An unexpected error occurred');
    
    if (error.response) {
      // Handle HTTP errors
      switch (error.response.status) {
        case 401:
          userFriendlyError = new Error('Invalid username or password');
          break;
        case 403:
          userFriendlyError = new Error('Your account has been locked. Please contact support.');
          break;
        case 404:
          userFriendlyError = new Error('Service temporarily unavailable. Please try again later.');
          break;
        case 500:
          userFriendlyError = new Error('Server error. Please try again later.');
          break;
        default:
          if (error.response.data && error.response.data.message) {
            userFriendlyError = new Error(error.response.data.message);
          }
      }
    } else if (error.request) {
      // Network error
      userFriendlyError = new Error('Network error. Please check your internet connection.');
    }
    
    throw userFriendlyError;
  }
}; 