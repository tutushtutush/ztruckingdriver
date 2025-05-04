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

    it('should successfully log error and return success flag', async () => {
      // Arrange
      mockHttpClient.post.mockResolvedValue({ data: {} });

      // Act
      const result = await errorTrackingApi.logError(mockErrorData);

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${baseApiUrl}/api/error/log`,
        mockErrorData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle API error and return failure flag', async () => {
      // Arrange
      mockHttpClient.post.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await errorTrackingApi.logError(mockErrorData);

      // Assert
      expect(result).toEqual({ success: false });
    });

    it('should handle network error and return failure flag', async () => {
      // Arrange
      mockHttpClient.post.mockRejectedValue({ message: 'Network Error' });

      // Act
      const result = await errorTrackingApi.logError(mockErrorData);

      // Assert
      expect(result).toEqual({ success: false });
    });

    it('should handle malformed response and return failure flag', async () => {
      // Arrange
      mockHttpClient.post.mockResolvedValue(null);

      // Act
      const result = await errorTrackingApi.logError(mockErrorData);

      // Assert
      expect(result).toEqual({ success: false });
    });

    it('should handle empty error data', async () => {
      // Arrange
      mockHttpClient.post.mockResolvedValue({ data: {} });

      // Act
      const result = await errorTrackingApi.logError({});

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${baseApiUrl}/api/error/log`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual({ success: true });
    });
  });
}); 