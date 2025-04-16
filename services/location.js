import { Platform } from 'react-native';
import * as Location from 'expo-location';

export class LocationService {
  constructor(locationApi, authService, asyncStorageSvc) {
    this.locationApi = locationApi;
    this.authService = authService;
    this.asyncStorageSvc = asyncStorageSvc;
    this.watchId = null;
    this.locationCallback = null;
    this.locationHistoryKey = 'locationHistory';
  }

  async requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async startTracking(callback) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    // Start watching position
    this.locationCallback = callback;
    this.watchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      async (location) => {
        const { latitude, longitude } = location.coords;
        const timestamp = location.timestamp;
        let locationData = { latitude, longitude, timestamp };

        try {
          // Try to get the address
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          
          if (address) {
            locationData.formattedAddress = `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
          }
        } catch (error) {
          // If reverse geocoding fails, continue with just coordinates
          console.error('Reverse geocoding failed:', error);
        }

        // Always update callback with latest location data
        if (this.locationCallback) {
          this.locationCallback(locationData);
        }

        // Save to local storage
        await this.saveLocationToLocalHistory(locationData);

        // Send location data to API if auth service is available
        if (this.locationApi && this.authService) {
          try {
            const token = this.authService.getToken();
            if (token) {
              await this.locationApi.sendLocationData(locationData, token);
            }
          } catch (error) {
            console.error('Failed to send location data to API:', error);
          }
        }
      }
    );
  }

  async stopTracking() {
    if (this.watchId !== null) {
      await Location.removeWatchAsync(this.watchId);
      this.watchId = null;
      this.locationCallback = null;
    }
  }

  async saveLocationToLocalHistory(locationData) {
    if (!this.asyncStorageSvc) return;
    
    try {
      // Get existing history
      const existingHistory = await this.getLocalLocationHistory();
      
      // Add new location to the beginning of the array
      const updatedHistory = [locationData, ...existingHistory];
      
      // Limit history to last 100 entries to prevent excessive storage usage
      const limitedHistory = updatedHistory.slice(0, 100);
      
      // Save back to storage
      await this.asyncStorageSvc.setItem(this.locationHistoryKey, limitedHistory);
    } catch (error) {
      console.error('Failed to save location to local history:', error);
    }
  }

  async getLocalLocationHistory() {
    if (!this.asyncStorageSvc) return [];
    
    try {
      const history = await this.asyncStorageSvc.getItem(this.locationHistoryKey);
      return history || [];
    } catch (error) {
      console.error('Failed to get local location history:', error);
      return [];
    }
  }

  async getLocationHistory() {
    // First try to get from API
    if (this.locationApi && this.authService) {
      try {
        const token = this.authService.getToken();
        if (token) {
          const apiHistory = await this.locationApi.getLocationHistory(token);
          
          // If API call succeeds, update local storage with the latest data
          if (apiHistory && apiHistory.length > 0) {
            await this.asyncStorageSvc.setItem(this.locationHistoryKey, apiHistory);
          }
          
          return apiHistory;
        }
      } catch (error) {
        console.error('Failed to get location history from API:', error);
        // Don't throw error, fall back to local storage
      }
    }
    console.log('Falling back to local storage');
    // Fall back to local storage if API fails or is not available
    return this.getLocalLocationHistory();
  }
}

export const locationService = new LocationService(); 