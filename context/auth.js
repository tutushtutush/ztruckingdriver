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
  const authApi = useMemo(() => new AuthApi(httpClient, BASE_API_URL), []);
  const asyncStorageSvc = useMemo(() => new AsyncStorageService(AsyncStorage), []);
  const authSvc = useMemo(() => new AuthService(authApi, asyncStorageSvc), []);
  const userApi = useMemo(() => new UserApi(httpClient, BASE_API_URL), []);
  const userSvc = useMemo(() => new UserService(userApi, asyncStorageSvc), []);

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
        } else {
          console.error('User not found');
          await authSvc.clearAllStorage();
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async ({ profileEmail, profilePassword, rememberMe }) => {
    try {
      const success = await authSvc.signIn({ profileEmail, profilePassword });
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
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setToken(null);
      setUser(null);
      await authSvc.clearAllStorage();
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await authSvc.clearAllStorage();
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

