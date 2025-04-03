import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageService from '../services/asyncStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create an instance of AsyncStorageService
  const asyncStorageSvc = new AsyncStorageService(AsyncStorage);

  // Load authentication state from AsyncStorage
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await asyncStorageSvc.getItem('authToken');
        const storedUser = await asyncStorageSvc.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthData();
  }, []);

  // Login function (store token)
  const login = async (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    await asyncStorageSvc.setItem('user', userData);
    await asyncStorageSvc.setItem('authToken', authToken);
  };

  // Logout function (clear token)
  const logout = async () => {
    setUser(null);
    setToken(null);
    await asyncStorageSvc.removeItem('user');
    await asyncStorageSvc.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthContext, useAuth };
