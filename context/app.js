import React from 'react';
import { LocationProvider } from './location';
import { AuthProvider } from './auth';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <LocationProvider>
        {children}
      </LocationProvider>
    </AuthProvider>
  );
};
