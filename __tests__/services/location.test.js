import * as Location from 'expo-location';
import { LocationService } from '../../services/location';
import { LocationApi } from '../../api/location';
import { AuthService } from '../../services/auth';
import { AsyncStorageService } from '../../services/asyncStorage';

// Mock the expo-location module
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  removeWatchAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

// Mock the LocationApi
jest.mock('../../api/location', () => ({
  LocationApi: jest.fn().mockImplementation(() => ({
    sendLocationData: jest.fn(),
    getLocationHistory: jest.fn(),
  })),
}));

// Mock the AuthService
jest.mock('../../services/auth', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    getToken: jest.fn(),
  })),
}));

// Mock the AsyncStorageService
jest.mock('../../services/asyncStorage', () => ({
  AsyncStorageService: jest.fn().mockImplementation(() => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clearAllStorage: jest.fn(),
  })),
}));

describe('LocationService', () => {
  let location;
  let mockLocationApi;
  let mockAuthService;
  let mockAsyncStorageSvc;
  const mockLocation = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    timestamp: 1234567890,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create mock instances
    mockLocationApi = new LocationApi();
    mockAuthService = new AuthService();
    mockAsyncStorageSvc = new AsyncStorageService();
    
    // Create a new LocationService instance for each test
    location = new LocationService(mockLocationApi, mockAuthService, mockAsyncStorageSvc);
  });

  describe('requestPermissions', () => {
    it('should return true when permissions are granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      const result = await location.requestPermissions();
      
      expect(result).toBe(true);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    it('should return false when permissions are denied', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      const result = await location.requestPermissions();
      
      expect(result).toBe(false);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('startTracking', () => {
    const mockCallback = jest.fn();

    it('should throw error when permissions are not granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      await expect(location.startTracking(mockCallback)).rejects.toThrow('Location permission not granted');
    });

    it('should handle location updates with successful reverse geocoding and API integration', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockResolvedValue([{
        street: '123 Main St',
        city: 'New York',
        region: 'NY'
      }]);
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockResolvedValue({ success: true });
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        setTimeout(() => callback(mockLocation), 0);
        return Promise.resolve({ remove: jest.fn() });
      });

      await location.startTracking(mockCallback);

      // Wait for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp,
        formattedAddress: '123 Main St New York NY'
      });

      expect(mockLocationApi.sendLocationData).toHaveBeenCalledWith(
        {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: mockLocation.timestamp,
          formattedAddress: '123 Main St New York NY'
        },
        'test-token'
      );
      
      // Verify local storage was updated
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp,
            formattedAddress: '123 Main St New York NY'
          })
        ])
      );
    });

    it('should handle location updates when reverse geocoding fails but still send to API', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockRejectedValue(new Error('Geocoding failed'));
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockResolvedValue({ success: true });
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        setTimeout(() => callback(mockLocation), 0);
        return Promise.resolve({ remove: jest.fn() });
      });

      await location.startTracking(mockCallback);

      // Wait for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify callback was called with basic location data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp
      });

      // Verify API call was made with basic location data
      expect(mockLocationApi.sendLocationData).toHaveBeenCalledWith(
        {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: mockLocation.timestamp
        },
        'test-token'
      );
      
      // Verify local storage was updated with basic location data
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp
          })
        ])
      );
    });

    it('should handle API errors gracefully', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockResolvedValue([{
        street: '123 Main St',
        city: 'New York',
        region: 'NY'
      }]);
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockRejectedValue(new Error('API Error'));
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        setTimeout(() => callback(mockLocation), 0);
        return Promise.resolve({ remove: jest.fn() });
      });

      await location.startTracking(mockCallback);

      // Wait for the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify callback was still called with location data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp,
        formattedAddress: '123 Main St New York NY'
      });
      
      // Verify local storage was still updated
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp,
            formattedAddress: '123 Main St New York NY'
          })
        ])
      );
    });
  });

  describe('stopTracking', () => {
    it('should not call removeWatchAsync when no tracking is active', async () => {
      await location.stopTracking();
      
      expect(Location.removeWatchAsync).not.toHaveBeenCalled();
    });

    it('should stop tracking when tracking is active', async () => {
      // Set up an active tracking session
      location.watchId = 123;
      location.locationCallback = jest.fn();

      await location.stopTracking();
      
      expect(Location.removeWatchAsync).toHaveBeenCalledWith(123);
      expect(location.watchId).toBeNull();
      expect(location.locationCallback).toBeNull();
    });
  });

  describe('getLocationHistory', () => {
    it('should return empty array when no auth token is available and no local history', async () => {
      mockAuthService.getToken.mockReturnValue(null);
      mockAsyncStorageSvc.getItem.mockResolvedValue(null);
      
      const result = await location.getLocationHistory();
      
      expect(result).toEqual([]);
      expect(mockLocationApi.getLocationHistory).not.toHaveBeenCalled();
    });

    it('should fetch location history from API when auth token is available', async () => {
      const mockHistory = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 },
        { latitude: 40.7129, longitude: -74.0061, timestamp: 1234567891 }
      ];
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.getLocationHistory.mockResolvedValue(mockHistory);
      
      const result = await location.getLocationHistory();
      
      expect(result).toEqual(mockHistory);
      expect(mockLocationApi.getLocationHistory).toHaveBeenCalledWith('test-token');
      
      // Verify local storage was updated with API data
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('locationHistory', mockHistory);
    });

    it('should fall back to local storage when API call fails', async () => {
      const mockLocalHistory = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 }
      ];
      
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.getLocationHistory.mockRejectedValue(new Error('API Error'));
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockLocalHistory);
      
      const result = await location.getLocationHistory();
      
      expect(result).toEqual(mockLocalHistory);
      expect(mockLocationApi.getLocationHistory).toHaveBeenCalledWith('test-token');
    });
  });

  describe('local storage methods', () => {
    it('should save location to local history', async () => {
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: 1234567890,
        formattedAddress: '123 Main St, New York, NY'
      };
      
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);
      
      await location.saveLocationToLocalHistory(locationData);
      
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('locationHistory');
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        [locationData]
      );
    });

    it('should limit local history to 100 entries', async () => {
      // Create 110 mock location entries
      const existingHistory = Array.from({ length: 110 }, (_, i) => ({
        latitude: 40.7128 + i * 0.0001,
        longitude: -74.0060,
        timestamp: 1234567890 + i
      }));
      
      const newLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: 1234567890,
        formattedAddress: '123 Main St, New York, NY'
      };
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(existingHistory);
      
      await location.saveLocationToLocalHistory(newLocation);
      
      // Verify that the history is limited to 100 entries
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        expect.arrayContaining([
          expect.objectContaining(newLocation)
        ])
      );
      
      const savedHistory = mockAsyncStorageSvc.setItem.mock.calls[0][1];
      expect(savedHistory.length).toBeLessThanOrEqual(100);
    });

    it('should get local location history', async () => {
      const mockHistory = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 }
      ];
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockHistory);
      
      const result = await location.getLocalLocationHistory();
      
      expect(result).toEqual(mockHistory);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('locationHistory');
    });

    it('should return empty array when local storage fails', async () => {
      mockAsyncStorageSvc.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await location.getLocalLocationHistory();
      
      expect(result).toEqual([]);
    });
  });
}); 