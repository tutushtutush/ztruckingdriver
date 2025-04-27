import * as Location from 'expo-location';
import { LocationService } from '../../services/location';
import { LocationApi } from '../../api/location';
import { AuthService } from '../../services/auth';

// Mock the expo-location module
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  removeWatchAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

describe('LocationService', () => {
  let locationService;
  let mockLocationApi;
  let mockAuthService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockLocationApi = {
      sendLocationData: jest.fn(),
    };

    mockAuthService = {
      getToken: jest.fn(),
    };

    // Create service instance
    locationService = new LocationService(mockLocationApi, mockAuthService);
  });

  afterEach(() => {
    // Clean up any pending timers
    jest.useRealTimers();
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with locationApi and authService', () => {
      expect(locationService.locationApi).toBe(mockLocationApi);
      expect(locationService.authService).toBe(mockAuthService);
      expect(locationService.watchId).toBeNull();
      expect(locationService.locationCallback).toBeNull();
    });
  });

  describe('requestPermissions', () => {
    it('should return true when permission is granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      const result = await locationService.requestPermissions();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      const result = await locationService.requestPermissions();
      expect(result).toBe(false);
    });
  });

  describe('startTracking', () => {
    const mockCallback = jest.fn();

    beforeEach(() => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.watchPositionAsync.mockResolvedValue('watch-id');
    });

    it('should throw error when permission is not granted', async () => {
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      await expect(locationService.startTracking(mockCallback)).rejects.toThrow('Location permission not granted');
    });

    it('should start watching position with correct options', async () => {
      await locationService.startTracking(mockCallback);
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        expect.any(Function)
      );
    });

    it('should handle location updates correctly', async () => {
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitudeAccuracy: 5,
          heading: 180
        }
      };

      // Mock watchPositionAsync to capture the callback
      let capturedCallback;
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        capturedCallback = callback;
        return Promise.resolve('watch-id');
      });

      await locationService.startTracking(mockCallback);
      
      // Call the captured callback with mock location
      await capturedCallback(mockLocation);

      // Verify callback was called with correct data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitudeAccuracy: 5,
        heading: 180,
        locationTimeStamp: expect.any(String)
      });
    });

    it('should send location data to API when token is available', async () => {
      mockAuthService.getToken.mockResolvedValue('test-token');
      
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          altitudeAccuracy: 5,
          heading: 180
        }
      };

      // Mock watchPositionAsync to capture the callback
      let capturedCallback;
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        capturedCallback = callback;
        return Promise.resolve('watch-id');
      });

      await locationService.startTracking(mockCallback);
      
      // Call the captured callback with mock location
      await capturedCallback(mockLocation);

      expect(mockLocationApi.sendLocationData).toHaveBeenCalledWith(
          expect.objectContaining({
        latitude: 40.7128,
        longitude: -74.0060,
          accuracy: 10,
          altitudeAccuracy: 5,
          heading: 180,
          locationTimeStamp: expect.any(String)
        }),
        'test-token'
      );
    });

    it('should not send location data to API when token is not available', async () => {
      mockAuthService.getToken.mockResolvedValue(null);
      
      const mockLocation = {
        coords: {
        latitude: 40.7128,
        longitude: -74.0060,
          accuracy: 10,
          altitudeAccuracy: 5,
          heading: 180
        }
      };

      // Mock watchPositionAsync to capture the callback
      let capturedCallback;
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        capturedCallback = callback;
        return Promise.resolve('watch-id');
      });

      await locationService.startTracking(mockCallback);
      
      // Call the captured callback with mock location
      await capturedCallback(mockLocation);

      expect(mockAuthService.getToken).toHaveBeenCalled();
      expect(mockLocationApi.sendLocationData).not.toHaveBeenCalled();
    });
  });

  describe('stopTracking', () => {
    it('should stop watching position and reset state', async () => {
      locationService.watchId = 'watch-id';
      locationService.locationCallback = jest.fn();

      await locationService.stopTracking();

      expect(Location.removeWatchAsync).toHaveBeenCalledWith('watch-id');
      expect(locationService.watchId).toBeNull();
      expect(locationService.locationCallback).toBeNull();
    });

    it('should do nothing if not tracking', async () => {
      await locationService.stopTracking();
      expect(Location.removeWatchAsync).not.toHaveBeenCalled();
    });
  });
}); 