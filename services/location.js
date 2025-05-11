import { Platform } from 'react-native';
import * as Location from 'expo-location';

export class LocationService {
  constructor(locationApi, authService, errorTracker) {
    this.locationApi = locationApi;
    this.authService = authService;
    this.errorTracker = errorTracker;
    this.watchId = null;
    this.locationCallback = null;
  }

  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'LocationService/requestPermissions', {
          method: 'REQUEST_PERMISSIONS',
          platform: Platform.OS,
        });
      }
      throw error;
    }
  }

  async getAddressFromCoordinates(latitude, longitude) {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (address) {
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        if (address.country) parts.push(address.country);
        return parts.join(', ');
      }
      return null;
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'LocationService/getAddressFromCoordinates', {
          method: 'REVERSE_GEOCODE',
          coordinates: { latitude, longitude }
        });
      }
      return null;
    }
  }

  async startTracking(callback) {
    try {
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

          // Get address information
          const formattedAddress = await this.getAddressFromCoordinates(latitude, longitude);

          // Format location data according to schema
          const locationData = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            accuracy: accuracy ? parseFloat(accuracy) : undefined,
            altitudeAccuracy: altitudeAccuracy ? parseFloat(altitudeAccuracy) : undefined,
            heading: heading !== null && heading !== undefined ? parseFloat(heading) : 0,
            locationTimeStamp: new Date().toISOString(),
            formattedAddress
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
              if (this.errorTracker) {
                const token = await this.authService.getToken();
                await this.errorTracker.trackApiError(error, 'LocationService/sendLocationData', {
                  method: 'SEND_LOCATION',
                  hasToken: !!token,
                  locationData: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                    timestamp: locationData.locationTimeStamp,
                  },
                });
              }
            }
          }
        }
      );
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'LocationService/startTracking', {
          method: 'START_TRACKING',
          platform: Platform.OS,
          hasPermission: false,
        });
      }
      throw error;
    }
  }

  async stopTracking() {
    try {
      if (this.watchId !== null) {
        await Location.removeWatchAsync(this.watchId);
        this.watchId = null;
        this.locationCallback = null;
      }
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'LocationService/stopTracking', {
          method: 'STOP_TRACKING',
          platform: Platform.OS,
          hasWatchId: !!this.watchId,
        });
      }
      throw error;
    }
  }
}

export const locationService = new LocationService(); 