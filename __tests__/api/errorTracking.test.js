import { ErrorTrackingApi } from '../../api/errorTracking';

describe('ErrorTrackingApi', () => {
  let errorTrackingApi;
  let mockHttpClient;
  const baseApiUrl = 'https://api.example.com';

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      post: jest.fn(),
    };
    errorTrackingApi = new ErrorTrackingApi(mockHttpClient, baseApiUrl);
  });

  describe('logError', () => {
    const mockErrorData = {
      error: {
        message: 'Test error',
        stack: 'Error stack',
        name: 'Error',
      },
      context: {
        platform: 'ios',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    };

    it('should return success flag since remote API is not ready', async () => {
      // Act
      const result = await errorTrackingApi.logError(mockErrorData);

      // Assert
      expect(mockHttpClient.post).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should handle empty error data', async () => {
      // Act
      const result = await errorTrackingApi.logError({});

      // Assert
      expect(mockHttpClient.post).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
}); 