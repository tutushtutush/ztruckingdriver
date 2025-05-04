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
        mayShowUserSettingsDialog: true,
        heading: true
      },
      async (location) => {
        const { 
          latitude, 
          longitude, 
          accuracy, 
          altitudeAccuracy, 
          heading 
        } = location.coords;

        // Format location data according to schema
        const locationData = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy: accuracy ? parseFloat(accuracy) : undefined,
          altitudeAccuracy: altitudeAccuracy ? parseFloat(altitudeAccuracy) : undefined,
          heading: heading !== null && heading !== undefined ? parseFloat(heading) : 0,
          locationTimeStamp: new Date().toISOString()
        };

        // Update callback with latest location data
        if (this.locationCallback) {
          this.locationCallback(locationData);
        }

        // Send location data to API if auth service is available
        if (this.locationApi && this.authService) {
          try {
            const token = await this.authService.getToken();
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
}

export const locationService = new LocationService(); 