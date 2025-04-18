import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationService } from '../services/location';
import { LocationApi } from '../api/location';
import { AuthService } from '../services/auth';
import { AsyncStorageService } from '../services/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_API_URL } from '../util/const';
import NetInfo from '@react-native-community/netinfo';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [failedLocationsCount, setFailedLocationsCount] = useState(0);

  // Create instances of required services
  const locationApi = new LocationApi(axios, BASE_API_URL);
  const asyncStorageSvc = new AsyncStorageService(AsyncStorage);
  const authService = new AuthService(locationApi, asyncStorageSvc);
  const locationService = new LocationService(locationApi, authService, asyncStorageSvc);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      setIsOnline(state.isConnected && state.isInternetReachable);
      
      // If we're coming back online, retry failed locations
      if (wasOffline && state.isConnected && state.isInternetReachable) {
        retryFailedLocations();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  useEffect(() => {
    return () => {
      if (isTracking) {
        locationService.stopTracking();
      }
    };
  }, [isTracking]);

  const startTracking = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await locationService.startTracking((newLocation) => {
        setLocation(newLocation);
        setLocationHistory((prev) => [newLocation, ...prev]);
      });
      setIsTracking(true);
    } catch (err) {
      console.error('Error starting tracking:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await locationService.stopTracking();
      setIsTracking(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocationHistory = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const history = await locationService.getLocationHistory();
      setLocationHistory(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const retryFailedLocations = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await locationService.retryFailedLocations();
      // Refresh the location history after retrying
      await loadLocationHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update failed locations count periodically
  useEffect(() => {
    const updateFailedCount = async () => {
      const failedLocations = await locationService.getFailedLocations();
      setFailedLocationsCount(failedLocations.length);
    };

    updateFailedCount();
    const interval = setInterval(updateFailedCount, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const value = {
    location,
    error,
    isTracking,
    locationHistory,
    isLoading,
    isOnline,
    failedLocationsCount,
    startTracking,
    stopTracking,
    loadLocationHistory,
    retryFailedLocations,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};