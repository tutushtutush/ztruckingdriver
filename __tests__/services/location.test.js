import * as Location from 'expo-location';
import { LocationService } from '../../services/location';
import { LocationApi } from '../../api/location';
import { AuthService } from '../../services/auth';

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

describe('LocationService', () => {
  let location;
  let mockLocationApi;
  let mockAuthService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create mock instances
    mockLocationApi = new LocationApi();
    mockAuthService = new AuthService();
    
    // Create a new LocationService instance for each test
    location = new LocationService(mockLocationApi, mockAuthService);
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
    const mockLocation = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      timestamp: 1234567890,
    };

    it('should throw error when permissions are denied', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      await expect(location.startTracking(mockCallback))
        .rejects
        .toThrow('Location permission not granted');
      
      expect(Location.watchPositionAsync).not.toHaveBeenCalled();
    });

    it('should start tracking when permissions are granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.watchPositionAsync.mockResolvedValue({ remove: jest.fn() });
      
      await location.startTracking(mockCallback);
      
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        expect.any(Function)
      );
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

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      await location.startTracking(mockCallback);

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
    });

    it('should handle location updates when reverse geocoding fails but still send to API', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockRejectedValue(new Error('Geocoding failed'));
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockResolvedValue({ success: true });

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      await location.startTracking(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp,
      });

      expect(mockLocationApi.sendLocationData).toHaveBeenCalledWith(
        {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: mockLocation.timestamp,
        },
        'test-token'
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

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      // Should not throw error
      await expect(location.startTracking(mockCallback)).resolves.not.toThrow();
      
      // Callback should still be called
      expect(mockCallback).toHaveBeenCalled();
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
    it('should return empty array when no auth token is available', async () => {
      mockAuthService.getToken.mockReturnValue(null);
      
      const result = await location.getLocationHistory();
      
      expect(result).toEqual([]);
      expect(mockLocationApi.getLocationHistory).not.toHaveBeenCalled();
    });

    it('should fetch location history when auth token is available', async () => {
      const mockHistory = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 },
        { latitude: 40.7129, longitude: -74.0061, timestamp: 1234567891 }
      ];
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.getLocationHistory.mockResolvedValue(mockHistory);
      
      const result = await location.getLocationHistory();
      
      expect(result).toEqual(mockHistory);
      expect(mockLocationApi.getLocationHistory).toHaveBeenCalledWith('test-token');
    });

    it('should throw error when API call fails', async () => {
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.getLocationHistory.mockRejectedValue(new Error('API Error'));
      
      await expect(location.getLocationHistory()).rejects.toThrow('API Error');
    });
  });
}); 