import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationService } from '../services/location';
import { LocationApi } from '../api/location';
import { AuthService } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_API_URL } from '../util/const';
import NetInfo from '@react-native-community/netinfo';
import { trackApiError, trackUserError } from '../utils/errorTracking';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Create instances of required services with error tracking
  const locationApi = new LocationApi(axios, BASE_API_URL, { trackApiError });
  const authService = new AuthService(locationApi, AsyncStorage, { trackApiError });
  const locationService = new LocationService(locationApi, authService, { trackApiError });

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const newOnlineState = state.isConnected && state.isInternetReachable;
      if (newOnlineState !== isOnline) {
        if (!newOnlineState) {
          trackUserError(
            new Error('Network connection lost'),
            'network_status_change',
            'LocationProvider'
          );
        }
        setIsOnline(newOnlineState);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  useEffect(() => {
    return () => {
      if (isTracking) {
        try {
          locationService.stopTracking();
        } catch (err) {
          trackApiError(err, 'LocationProvider/cleanup', {
            isTracking,
          });
        }
      }
    };
  }, [isTracking]);

  const startTracking = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await locationService.startTracking((newLocation) => {
        setLocation(newLocation);
      });
      setIsTracking(true);
    } catch (err) {
      await trackApiError(err, 'LocationProvider/startTracking', {
        isOnline,
        previousLocation: !!location,
      });
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
      await trackApiError(err, 'LocationProvider/stopTracking', {
        isOnline,
        isTracking,
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    location,
    error,
    isTracking,
    isLoading,
    isOnline,
    startTracking,
    stopTracking,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};