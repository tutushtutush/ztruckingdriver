// locationApi.test.js
import { LocationApi } from '../../api/location';

describe('LocationApi', () => {
  let locationApi;
  let mockHttpClient;
  const baseApiUrl = 'testBaseApiUrl';

  beforeEach(() => {
    // Create a mock HTTP client
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn()
    };
    
    locationApi = new LocationApi(mockHttpClient, baseApiUrl);
    jest.clearAllMocks();
  });

  const mockToken = 'test-token';
  const mockLocationData = {
    latitude: 40.7128,
    longitude: -74.0060,
    timestamp: 1234567890,
    formattedAddress: '123 Main St, New York, NY'
  };

  describe('sendLocationData', () => {
    it('should successfully send location data to the API', async () => {
      // Arrange
      mockHttpClient.post.mockResolvedValue({ data: { success: true } });

      // Act
      const result = await locationApi.sendLocationData(mockLocationData, mockToken);

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${baseApiUrl}/api/location/track`,
        mockLocationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle API errors when sending location data', async () => {
      // Arrange
      const errorMessage = 'Network error';
      mockHttpClient.post.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(locationApi.sendLocationData(mockLocationData, mockToken))
        .rejects
        .toThrow(errorMessage);
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
    });

    it('should handle API errors when retrieving location history', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch history';
      mockHttpClient.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(locationApi.getLocationHistory(mockToken))
        .rejects
        .toThrow(errorMessage);
    });
  });
}); 