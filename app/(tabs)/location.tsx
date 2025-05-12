import { View, Text, Pressable } from 'react-native';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocation } from '../../context/location';

interface LocationData {
  latitude: number;
  longitude: number;
  locationTimeStamp: string;
  formattedAddress?: string;
}

// Function to convert decimal degrees to degrees, minutes, seconds format
const decimalToDMS = (decimal: number, isLatitude: boolean): string => {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  const direction = isLatitude
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W';

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const LocationScreen = () => {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    location, 
    isLoading,
    isOnline
  } = useLocation();

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-2xl font-bold text-white mb-8">Location Tracking</Text>
        
        {/* Network Status */}
        <View className="flex-row items-center mb-4">
          <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className="text-light-200">{isOnline ? 'Online' : 'Offline'}</Text>
        </View>

        <Pressable 
          onPress={() => isTracking ? stopTracking() : startTracking()}
          className="flex-row items-center justify-center bg-dark-100 p-4 rounded-lg mb-6"
        >
          <FontAwesome 
            name={isTracking ? "toggle-on" : "toggle-off"} 
            size={24} 
            color={isTracking ? "#4CAF50" : "#A8B5DB"} 
          />
          <Text className="text-light-200 text-lg ml-4">
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </Text>
        </Pressable>

        {location && (
          <View className="bg-dark-100 p-4 rounded-lg mb-6">
            <Text className="text-lg font-semibold text-white mb-2">Current Location</Text>
            <Text className="text-light-200">Latitude: {decimalToDMS(location.latitude, true)}</Text>
            <Text className="text-light-200">Longitude: {decimalToDMS(location.longitude, false)}</Text>
            {location.formattedAddress && (
              <View className="mt-2">
                <Text className="text-light-200 font-semibold">Location:</Text>
                <Text className="text-light-200 ml-2">{location.formattedAddress}</Text>
              </View>
            )}
            <Text className="text-light-200 mt-2">Time: {formatDate(location.locationTimeStamp)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default LocationScreen;
