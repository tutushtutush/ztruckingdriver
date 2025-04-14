import { Platform } from 'react-native';
import * as Location from 'expo-location';

export class LocationService {
  constructor(locationApi, authService) {
    this.locationApi = locationApi;
    this.authService = authService;
    this.watchId = null;
    this.locationCallback = null;
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

        // Try to get the address
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          
          const formattedAddress = address
            ? `${address.street || ''} ${address.city || ''} ${address.region || ''}`
            : undefined;

          const locationData = {
            latitude,
            longitude,
            timestamp,
            formattedAddress,
          };

          if (this.locationCallback) {
            this.locationCallback(locationData);
          }

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
        } catch (error) {
          // If reverse geocoding fails, still send the coordinates
          const locationData = {
            latitude,
            longitude,
            timestamp,
          };

          if (this.locationCallback) {
            this.locationCallback(locationData);
          }

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

  async getLocationHistory() {
    if (this.locationApi && this.authService) {
      try {
        const token = this.authService.getToken();
        if (token) {
          return await this.locationApi.getLocationHistory(token);
        }
      } catch (error) {
        console.error('Failed to get location history from API:', error);
        throw error;
      }
    }
    return [];
  }
}

export const locationService = new LocationService(); 