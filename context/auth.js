import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageService } from '../services/asyncStorage';
import { AuthService } from '../services/auth';
import { AuthApi } from '../api/auth';
import { HttpRequestClient } from '../clients/httpRequest';
import axios from 'axios';
import { UserService } from '../services/user';
import { UserApi } from '../api/user';
import { BASE_API_URL } from '../util/const';
import { initializeErrorTracking, trackApiError, setUserContext, clearUserContext } from '../utils/errorTracking';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rememberedUsername, setRememberedUsername] = useState('');

  const httpClient = useMemo(() => new HttpRequestClient(axios), []);
  const asyncStorageSvc = useMemo(() => new AsyncStorageService(AsyncStorage, { trackApiError }), []);
  const authApi = useMemo(() => new AuthApi(httpClient, BASE_API_URL, { trackApiError }), []);
  const authSvc = useMemo(() => new AuthService(authApi, asyncStorageSvc, { trackApiError }), []);
  const userApi = useMemo(() => new UserApi(httpClient, BASE_API_URL, { trackApiError }), []);
  const userSvc = useMemo(() => new UserService(userApi, asyncStorageSvc, { trackApiError }), []);

  // Initialize error tracking
  useEffect(() => {
    initializeErrorTracking(httpClient, BASE_API_URL);
  }, [httpClient]);

  // Load and validate auth state from AsyncStorage
  useEffect(() => {
    const loadAuthData = async () => {
      setLoading(true);
      try {
        // Load remembered username
        const storedUsername = await authSvc.getRememberedUsername();
        if (storedUsername) {
          setRememberedUsername(storedUsername);
        }

        const storedToken = await authSvc.getToken();
        if (!storedToken) {
          setLoading(false);
          return;
        }

        const isValid = await authSvc.isTokenValid();
        if (!isValid) {
          await authSvc.clearAllStorage();
          setLoading(false);
          return;
        }

        // Get user data from storage
        const storedUser = await userSvc.getUser();
        if (storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setUserContext(storedUser.id, storedUser.email);
        } else {
          await trackApiError(new Error('User not found'), 'AuthProvider/loadAuthData', {
            hasToken: true,
            hasValidToken: true,
          });
          await authSvc.clearAllStorage();
        }
      } catch (error) {
        await trackApiError(error, 'AuthProvider/loadAuthData', {
          hasToken: !!token,
          hasValidToken: false,
        });
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async ({ profileEmail, profilePassword, rememberMe }) => {
    try {
      const response = await authSvc.signIn({ profileEmail, profilePassword });
      const token = await authSvc.getToken();
      const user = await userSvc.getUser();

      // Handle remember me
      if (rememberMe) {
        await authSvc.setRememberedUsername(profileEmail);
        setRememberedUsername(profileEmail);
      } else {
        await authSvc.removeRememberedUsername();
        setRememberedUsername('');
      }

      setToken(token);
      setUser(user);
      setUserContext(user.id, user.email);
      return true;
    } catch (error) {
      await trackApiError(error, 'AuthProvider/login', {
        hasEmail: !!profileEmail,
        rememberMe,
      });
      setToken(null);
      setUser(null);
      await authSvc.clearAllStorage();
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      clearUserContext();
      await authSvc.clearAllStorage();
    } catch (error) {
      await trackApiError(error, 'AuthProvider/logout', {
        hasUser: !!user,
        hasToken: !!token,
      });
      // Still clear the state even if storage fails
      setUser(null);
      setToken(null);
      clearUserContext();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      login, 
      logout, 
      loading,
      rememberedUsername 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

