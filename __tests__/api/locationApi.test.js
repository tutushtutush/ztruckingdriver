// locationApi.test.js
import { LocationApi } from '../../api/location';

describe('LocationApi', () => {
  let locationApi;
  let mockHttpClient;
  let mockErrorTracker;
  const baseApiUrl = 'testBaseApiUrl';

  beforeEach(() => {
    // Create a mock HTTP client
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn()
    };

    // Create a mock error tracker
    mockErrorTracker = {
      trackApiError: jest.fn()
    };
    
    locationApi = new LocationApi(mockHttpClient, baseApiUrl, mockErrorTracker);
    jest.clearAllMocks();
  });

  const mockToken = 'test-token';
  const mockLocationData = {
    latitude: 40.7128,
    longitude: -74.0060,
    timestamp: 1234567890,
    formattedAddress: '123 Main St, New York, NY'
  };

  describe('constructor', () => {
    it('should initialize with http client, base url and error tracker', () => {
      const locationApi = new LocationApi(mockHttpClient, baseApiUrl, mockErrorTracker);
      expect(locationApi.httpClient).toBe(mockHttpClient);
      expect(locationApi.baseApiUrl).toBe(baseApiUrl);
      expect(locationApi.errorTracker).toBe(mockErrorTracker);
    });

    it('should work without error tracker', () => {
      const locationApi = new LocationApi(mockHttpClient, baseApiUrl);
      expect(locationApi.httpClient).toBe(mockHttpClient);
      expect(locationApi.baseApiUrl).toBe(baseApiUrl);
      expect(locationApi.errorTracker).toBeUndefined();
    });
  });

  describe('sendLocationData', () => {
    it('should successfully send location data to the API', async () => {
      // Arrange
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitudeAccuracy: 5,
        heading: 180,
        locationTimeStamp: '2024-01-01T00:00:00.000Z'
      };
      const token = 'test-token';
      const expectedResponse = { success: true };

      mockHttpClient.post.mockResolvedValue({ data: expectedResponse });

      // Act
      const result = await locationApi.sendLocationData(locationData, token);

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'testBaseApiUrl/d_api/location_update_app/',
        locationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );
      expect(result).toEqual(expectedResponse);
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });

    it('should track error when sending location data fails', async () => {
      // Arrange
      const error = new Error('Network error');
      error.response = {
        status: 500,
        data: { message: 'Server error' }
      };
      mockHttpClient.post.mockRejectedValue(error);

      // Act & Assert
      await expect(locationApi.sendLocationData(mockLocationData, mockToken))
        .rejects
        .toThrow('Network error');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        'testBaseApiUrl/d_api/location_update_app/',
        expect.objectContaining({
          method: 'POST',
          data: {
            ...mockLocationData,
            token: '***',
          },
          response: error.response.data,
          status: error.response.status,
        })
      );
    });

    it('should not track errors when no error tracker is provided', async () => {
      const locationApi = new LocationApi(mockHttpClient, baseApiUrl);
      const error = new Error('Network error');
      mockHttpClient.post.mockRejectedValue(error);

      await expect(locationApi.sendLocationData(mockLocationData, mockToken))
        .rejects
        .toThrow('Network error');
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });
  });

  describe('getLocationHistory', () => {
    it('should successfully retrieve location history from the API', async () => {
      // Arrange
      const mockHistory = [
        { ...mockLocationData, id: 1 },
        { ...mockLocationData, id: 2, latitude: 40.7129 }
      ];
      mockHttpClient.get.mockResolvedValue({ data: mockHistory });

      // Act
      const result = await locationApi.getLocationHistory(mockToken);

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${baseApiUrl}/api/location/history`,
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockHistory);
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });

    it('should track error when retrieving location history fails', async () => {
      // Arrange
      const error = new Error('Failed to fetch history');
      error.response = {
        status: 404,
        data: { message: 'Not found' }
      };
      mockHttpClient.get.mockRejectedValue(error);

      // Act & Assert
      await expect(locationApi.getLocationHistory(mockToken))
        .rejects
        .toThrow('Failed to fetch history');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        'testBaseApiUrl/api/location/history',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Authorization: 'Bearer ***',
          },
          response: error.response.data,
          status: error.response.status,
        })
      );
    });

    it('should not track errors when no error tracker is provided', async () => {
      const locationApi = new LocationApi(mockHttpClient, baseApiUrl);
      const error = new Error('Failed to fetch history');
      mockHttpClient.get.mockRejectedValue(error);

      await expect(locationApi.getLocationHistory(mockToken))
        .rejects
        .toThrow('Failed to fetch history');
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });
  });
}); 