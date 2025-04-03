import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locationOn, setLocationOn] = useState(false);

  return (
    <LocationContext.Provider value={{ locationOn, setLocationOn }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
