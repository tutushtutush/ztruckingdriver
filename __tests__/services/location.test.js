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

// Mock setInterval
jest.useFakeTimers();

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
    jest.clearAllTimers();
    
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
      // Set a longer timeout for this test
      jest.setTimeout(10000);

      // Enable fake timers in modern mode
      jest.useFakeTimers({ legacyFakeTimers: false });

      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockResolvedValue([{
        street: '123 Main St',
        city: 'New York',
        region: 'NY'
      }]);
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockResolvedValue({ success: true });
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);

      // Create a promise that resolves when setItem is called with locationHistory
      let locationHistoryPromise;
      const locationHistoryPromiseResolve = jest.fn();
      locationHistoryPromise = new Promise(resolve => {
        locationHistoryPromiseResolve.mockImplementation(resolve);
      });

      // Mock setItem to resolve the promise when called with locationHistory
      mockAsyncStorageSvc.setItem.mockImplementation(async (key, value) => {
        if (key === 'locationHistory') {
          locationHistoryPromiseResolve(value);
        }
      });

      // Create a promise that resolves when sendLocationData is called
      let sendLocationDataPromise;
      const sendLocationDataPromiseResolve = jest.fn();
      sendLocationDataPromise = new Promise(resolve => {
        sendLocationDataPromiseResolve.mockImplementation(resolve);
      });

      // Mock sendLocationData to resolve the promise when called
      mockLocationApi.sendLocationData.mockImplementation(async (data, token) => {
        sendLocationDataPromiseResolve({ data, token });
        return { success: true };
      });

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        // Call the callback immediately
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      // Mock setInterval to prevent infinite loops
      const mockSetInterval = jest.spyOn(global, 'setInterval');
      mockSetInterval.mockImplementation((callback) => {
        // Call the callback once immediately
        callback();
        return 123; // Return a mock interval ID
      });

      // Start tracking
      const trackingPromise = location.startTracking(mockCallback);
      
      // Run all pending timers and promises
      jest.runAllTimers();
      await trackingPromise;

      // Wait for both the location history to be saved and the API call to be made
      const [savedLocationHistory, apiCall] = await Promise.all([
        locationHistoryPromise,
        sendLocationDataPromise
      ]);

      // Verify callback was called with location data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp,
        formattedAddress: '123 Main St New York NY'
      });

      // Verify API call was made with location data
      expect(apiCall).toEqual({
        data: {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: mockLocation.timestamp,
          formattedAddress: '123 Main St New York NY'
        },
        token: 'test-token'
      });
      
      // Verify local storage was updated with location data
      expect(savedLocationHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp,
            formattedAddress: '123 Main St New York NY'
          })
        ])
      );

      // Clean up
      mockSetInterval.mockRestore();
      jest.useRealTimers();
      jest.clearAllMocks();
    }, 10000); // Add timeout to the test

    it('should handle location updates when reverse geocoding fails but still send to API', async () => {
      // Set a longer timeout for this test
      jest.setTimeout(10000);

      // Enable fake timers in modern mode
      jest.useFakeTimers({ legacyFakeTimers: false });

      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockRejectedValue(new Error('Geocoding failed'));
      mockAuthService.getToken.mockReturnValue('test-token');
      mockLocationApi.sendLocationData.mockResolvedValue({ success: true });
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);

      // Create a promise that resolves when setItem is called with locationHistory
      let locationHistoryPromise;
      const locationHistoryPromiseResolve = jest.fn();
      locationHistoryPromise = new Promise(resolve => {
        locationHistoryPromiseResolve.mockImplementation(resolve);
      });

      // Mock setItem to resolve the promise when called with locationHistory
      mockAsyncStorageSvc.setItem.mockImplementation(async (key, value) => {
        if (key === 'locationHistory') {
          locationHistoryPromiseResolve(value);
        }
      });

      // Create a promise that resolves when sendLocationData is called
      let sendLocationDataPromise;
      const sendLocationDataPromiseResolve = jest.fn();
      sendLocationDataPromise = new Promise(resolve => {
        sendLocationDataPromiseResolve.mockImplementation(resolve);
      });

      // Mock sendLocationData to resolve the promise when called
      mockLocationApi.sendLocationData.mockImplementation(async (data, token) => {
        sendLocationDataPromiseResolve({ data, token });
        return { success: true };
      });

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        // Call the callback immediately
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      // Mock setInterval to prevent infinite loops
      const mockSetInterval = jest.spyOn(global, 'setInterval');
      mockSetInterval.mockImplementation((callback) => {
        // Call the callback once immediately
        callback();
        return 123; // Return a mock interval ID
      });

      // Start tracking
      const trackingPromise = location.startTracking(mockCallback);
      
      // Run all pending timers and promises
      jest.runAllTimers();
      await trackingPromise;

      // Wait for both the location history to be saved and the API call to be made
      const [savedLocationHistory, apiCall] = await Promise.all([
        locationHistoryPromise,
        sendLocationDataPromise
      ]);

      // Verify callback was called with basic location data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp
      });

      // Verify API call was made with basic location data
      expect(apiCall).toEqual({
        data: {
          latitude: mockLocation.coords.latitude,
          longitude: mockLocation.coords.longitude,
          timestamp: mockLocation.timestamp
        },
        token: 'test-token'
      });
      
      // Verify local storage was updated with basic location data
      expect(savedLocationHistory).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp
          })
        ])
      );

      // Clean up
      mockSetInterval.mockRestore();
      jest.useRealTimers();
      jest.clearAllMocks();
    }, 10000); // Add timeout to the test

    it('should handle API errors gracefully and add to failed locations queue', async () => {
      // Set a longer timeout for this test
      jest.setTimeout(10000);

      // Enable fake timers in modern mode
      jest.useFakeTimers({ legacyFakeTimers: false });

      // Mock AsyncStorage methods
      mockAsyncStorageSvc.getItem.mockImplementation(async (key) => {
        if (key === 'locationHistory') return [];
        if (key === 'failedLocations') return [];
        return null;
      });
      mockAsyncStorageSvc.setItem.mockImplementation(async () => undefined);

      Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Location.reverseGeocodeAsync.mockResolvedValue([{
        street: '123 Main St',
        city: 'New York',
        region: 'NY'
      }]);
      mockAuthService.getToken.mockReturnValue('test-token');
      
      // Mock the API to reject with an error
      mockLocationApi.sendLocationData.mockRejectedValue(new Error('API Error'));

      // Create a promise that resolves when setItem is called with failedLocations
      let failedLocationsPromise;
      const failedLocationsPromiseResolve = jest.fn();
      failedLocationsPromise = new Promise(resolve => {
        failedLocationsPromiseResolve.mockImplementation(resolve);
      });

      // Mock setItem to resolve the promise when called with failedLocations
      mockAsyncStorageSvc.setItem.mockImplementation(async (key, value) => {
        if (key === 'failedLocations') {
          failedLocationsPromiseResolve(value);
        }
      });

      // Mock watchPositionAsync to immediately call the callback
      Location.watchPositionAsync.mockImplementation((options, callback) => {
        // Call the callback immediately
        callback(mockLocation);
        return Promise.resolve({ remove: jest.fn() });
      });

      // Mock setInterval to prevent infinite loops
      const mockSetInterval = jest.spyOn(global, 'setInterval');
      mockSetInterval.mockImplementation((callback) => {
        // Call the callback once immediately
        callback();
        return 123; // Return a mock interval ID
      });

      // Start tracking
      const trackingPromise = location.startTracking(mockCallback);
      
      // Run all pending timers and promises
      jest.runAllTimers();
      await trackingPromise;

      // Wait for the failed locations to be saved
      const savedFailedLocations = await failedLocationsPromise;

      // Verify callback was still called with location data
      expect(mockCallback).toHaveBeenCalledWith({
        latitude: mockLocation.coords.latitude,
        longitude: mockLocation.coords.longitude,
        timestamp: mockLocation.timestamp,
        formattedAddress: '123 Main St New York NY'
      });

      // Verify locationHistory was saved
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

      // Verify failed locations were saved
      expect(savedFailedLocations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            latitude: mockLocation.coords.latitude,
            longitude: mockLocation.coords.longitude,
            timestamp: mockLocation.timestamp,
            formattedAddress: '123 Main St New York NY'
          })
        ])
      );

      // Clean up
      mockSetInterval.mockRestore();
      jest.useRealTimers();
      jest.clearAllMocks();
    }, 10000); // Add timeout to the test
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

  // New tests for failed locations functionality
  describe('failed locations queue', () => {
    it('should add location to failed locations queue', async () => {
      const locationData = {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: 1234567890,
        formattedAddress: '123 Main St, New York, NY'
      };
      
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);
      
      await location.addToFailedLocations(locationData);
      
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('failedLocations');
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'failedLocations',
        [locationData]
      );
    });

    it('should get failed locations', async () => {
      const mockFailedLocations = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 },
        { latitude: 40.7129, longitude: -74.0061, timestamp: 1234567891 }
      ];
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockFailedLocations);
      
      const result = await location.getFailedLocations();
      
      expect(result).toEqual(mockFailedLocations);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('failedLocations');
    });

    it('should return empty array when failed locations storage fails', async () => {
      mockAsyncStorageSvc.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await location.getFailedLocations();
      
      expect(result).toEqual([]);
    });
  });

  describe('retry failed locations', () => {
    it('should not retry if already retrying', async () => {
      location.isRetrying = true;
      
      await location.retryFailedLocations();
      
      expect(mockAsyncStorageSvc.getItem).not.toHaveBeenCalled();
      expect(mockLocationApi.sendLocationData).not.toHaveBeenCalled();
    });

    it('should not retry if no failed locations', async () => {
      mockAsyncStorageSvc.getItem.mockResolvedValue([]);
      
      await location.retryFailedLocations();
      
      expect(mockAuthService.getToken).not.toHaveBeenCalled();
      expect(mockLocationApi.sendLocationData).not.toHaveBeenCalled();
    });

    it('should not retry if no auth token', async () => {
      const mockFailedLocations = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 }
      ];
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockFailedLocations);
      mockAuthService.getToken.mockReturnValue(null);
      
      await location.retryFailedLocations();
      
      expect(mockLocationApi.sendLocationData).not.toHaveBeenCalled();
    });

    it('should retry failed locations and update queues on success', async () => {
      const mockFailedLocations = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 },
        { latitude: 40.7129, longitude: -74.0061, timestamp: 1234567891 },
        { latitude: 40.7130, longitude: -74.0062, timestamp: 1234567892 }
      ];
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockFailedLocations);
      mockAuthService.getToken.mockReturnValue('test-token');
      
      // First location succeeds, second fails, third succeeds
      mockLocationApi.sendLocationData
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ success: true });
      
      await location.retryFailedLocations();
      
      // Verify API calls were made for all locations
      expect(mockLocationApi.sendLocationData).toHaveBeenCalledTimes(3);
      
      // Verify failed locations queue was updated with only the failed location
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'failedLocations',
        [mockFailedLocations[1]]
      );
      
      // Verify local history was updated with successful locations
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(
        'locationHistory',
        expect.arrayContaining([
          expect.objectContaining(mockFailedLocations[0]),
          expect.objectContaining(mockFailedLocations[2])
        ])
      );
    });

    it('should handle errors during retry process', async () => {
      const mockFailedLocations = [
        { latitude: 40.7128, longitude: -74.0060, timestamp: 1234567890 }
      ];
      
      mockAsyncStorageSvc.getItem.mockResolvedValue(mockFailedLocations);
      mockAuthService.getToken.mockReturnValue('test-token');
      mockAsyncStorageSvc.setItem.mockRejectedValue(new Error('Storage error'));
      
      // This should not throw an error
      await location.retryFailedLocations();
      
      // Verify isRetrying was reset to false
      expect(location.isRetrying).toBe(false);
    });
  });

  describe('periodic retry', () => {
    it('should set up interval for periodic retry', () => {
      // Enable fake timers
      jest.useFakeTimers({ legacyFakeTimers: false });

      // Mock setInterval
      const mockSetInterval = jest.fn();
      global.setInterval = mockSetInterval;

      // Spy on retryFailedLocations
      const retryFailedLocationsSpy = jest.spyOn(location, 'retryFailedLocations');
      
      // Call startPeriodicRetry
      location.startPeriodicRetry();
      
      // Verify setInterval was called with correct interval
      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes in milliseconds
      );
      
      // Get the callback function
      const intervalCallback = mockSetInterval.mock.calls[0][0];
      
      // Call the interval callback
      intervalCallback();
      
      // Verify retryFailedLocations was called
      expect(retryFailedLocationsSpy).toHaveBeenCalled();
      
      // Clean up
      jest.useRealTimers();
      jest.clearAllMocks();
    });
  });
}); 