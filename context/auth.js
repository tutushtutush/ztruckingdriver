import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncStorageService} from '../services/asyncStorage';
import {AuthService} from '../services/auth';
import {AuthApi} from '../api/auth';
import { HttpRequestClient } from '../clients/httpRequest';
import axios from 'axios';
import {UserService} from '../services/user';
import {UserApi} from '../api/user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const httpClient = useMemo(() => new HttpRequestClient(axios), []); 
  const authApi = useMemo(() => new AuthApi(httpClient, "process.env.BASE_API_URL"), []);
  const asyncStorageSvc = useMemo(() => new AsyncStorageService(AsyncStorage), []);
  const authSvc = useMemo(() => new AuthService(authApi, asyncStorageSvc), []);
  const userApi = useMemo(() => new UserApi(httpClient, "process.env.BASE_API_URL"), []);
  const userSvc = useMemo(() => new UserService(userApi, asyncStorageSvc), []);

  // Load and validate auth state from AsyncStorage
  useEffect(() => {
    const loadAuthData = async () => {
      setLoading(false);
      // try {
      //   const storedToken = await authSvc.getToken();
      //   if (!storedToken) {
      //     setLoading(false);
      //     return;
      //   }

      //   const isValid = await authSvc.isTokenValid();
      //   if (!isValid) {
      //     await authSvc.clearAllStorage();
      //     setLoading(false);
      //     return;
      //   }

      //   let userId;
      //   try {
      //     userId = authSvc.getUserIdFromToken(storedToken);
      //   } catch (error) {
      //     console.error('Invalid token:', error);
      //     await authSvc.clearAllStorage();
      //     setLoading(false);
      //     return;
      //   }

      //   if (!userId) {
      //     console.error('User ID not found in token');
      //     await authSvc.clearAllStorage();
      //     setLoading(false);
      //     return;
      //   }

      //   const storedUser = await userSvc.getUser(userId);
      //   if (storedUser) {
      //     setToken(storedToken);
      //     setUser(storedUser);
      //   } else {
      //     console.error('User not found');
      //     await authSvc.clearAllStorage();
      //   }
      // } catch (error) {
      //   console.error('Error loading auth data:', error);
      // } finally {
      //   setLoading(false);
      // }
    };

    loadAuthData();
  }, []);

  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    //await asyncStorageSvc.setItem('user', JSON.stringify(userData));
    //await asyncStorageSvc.setItem('authToken', authToken);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await authSvc.clearAllStorage();
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, useAuth };
