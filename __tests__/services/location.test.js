import * as Location from 'expo-location';
import { LocationService } from '../../services/location';
import { LocationApi } from '../../api/location';
import { AuthService } from '../../services/auth';
import { trackApiError } from '../../utils/errorTracking';
import { Platform } from 'react-native';

// Mock the expo-location module
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  removeWatchAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock error tracking
jest.mock('../../utils/errorTracking', () => ({
  trackApiError: jest.fn(),
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
    locationService = new LocationService(mockLocationApi, mockAuthService, { trackApiError });
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

    it('should track errors with context', async () => {
      const error = new Error('Permission error');
      Location.requestForegroundPermissionsAsync.mockRejectedValueOnce(error);

      await expect(locationService.requestPermissions()).rejects.toThrow('Permission error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'LocationService/requestPermissions', {
        method: 'REQUEST_PERMISSIONS',
        platform: 'ios',
      });
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
      // Arrange
      const mockCallback = jest.fn();
      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.watchPositionAsync.mockResolvedValue('watch-id');

      // Act
      await locationService.startTracking(mockCallback);

      // Assert
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
          mayShowUserSettingsDialog: true,
          heading: true
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

    it('should track initialization errors with context', async () => {
      const error = new Error('Tracking error');
      Location.watchPositionAsync.mockRejectedValueOnce(error);

      await expect(locationService.startTracking(mockCallback)).rejects.toThrow('Tracking error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'LocationService/startTracking', {
        method: 'START_TRACKING',
        platform: 'ios',
        hasPermission: false,
      });
    });

    it('should track API errors when sending location data', async () => {
      const mockWatchId = 'watch-123';
      const mockLocation = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
          altitudeAccuracy: 5,
          heading: 90,
        },
      };
      const error = new Error('API error');
      
      // Mock watchPositionAsync to capture the callback
      let locationCallback;
      Location.watchPositionAsync.mockImplementationOnce((options, callback) => {
        locationCallback = callback;
        return Promise.resolve(mockWatchId);
      });
      
      // Mock auth service to return a token
      mockAuthService.getToken.mockResolvedValue('test-token');
      
      // Mock location API to throw error
      mockLocationApi.sendLocationData.mockRejectedValueOnce(error);

      // Start tracking and wait for it to complete
      await locationService.startTracking(mockCallback);
      
      // Trigger the location callback
      await locationCallback(mockLocation);

      // Verify error tracking was called with correct context
      expect(trackApiError).toHaveBeenCalledWith(error, 'LocationService/sendLocationData', {
        method: 'SEND_LOCATION',
        hasToken: true,
        locationData: {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: expect.any(String),
        },
      });
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

    it('should track errors with context', async () => {
      const error = new Error('Stop tracking error');
      locationService.watchId = 'watch-123';
      Location.removeWatchAsync.mockRejectedValueOnce(error);

      await expect(locationService.stopTracking()).rejects.toThrow('Stop tracking error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'LocationService/stopTracking', {
        method: 'STOP_TRACKING',
        platform: 'ios',
        hasWatchId: true,
      });
    });
  });

  describe('error tracking optionality', () => {
    it('should work without error tracker', async () => {
      const serviceWithoutTracker = new LocationService(mockLocationApi, mockAuthService);
      const error = new Error('Permission error');
      Location.requestForegroundPermissionsAsync.mockRejectedValueOnce(error);

      await expect(serviceWithoutTracker.requestPermissions()).rejects.toThrow('Permission error');
      expect(trackApiError).not.toHaveBeenCalled();
    });
  });
}); 