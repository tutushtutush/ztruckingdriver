import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocation } from '../../context/location';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  formattedAddress?: string;
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const LocationScreen = () => {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    location, 
    locationHistory, 
    isLoading,
    loadLocationHistory,
    isOnline,
    failedLocationsCount,
    retryFailedLocations
  } = useLocation();

  // Load location history when component mounts
  useEffect(() => {
    loadLocationHistory();
  }, []);

  return (
    <View className="flex-1 bg-primary">
      <View className="flex-1 px-5 pt-8">
        <Text className="text-2xl font-bold text-white mb-8">Location Tracking</Text>
        
        {/* Network Status */}
        <View className="flex-row items-center mb-4">
          <View className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className="text-light-200">{isOnline ? 'Online' : 'Offline'}</Text>
          {failedLocationsCount > 0 && (
            <View className="flex-row items-center ml-4">
              <Text className="text-light-200 mr-2">{failedLocationsCount} failed updates</Text>
              <Pressable 
                onPress={retryFailedLocations}
                className="bg-dark-100 px-3 py-1 rounded-lg"
              >
                <Text className="text-light-200">Retry</Text>
              </Pressable>
            </View>
          )}
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
            <Text className="text-light-200">Latitude: {location.latitude.toFixed(6)}</Text>
            <Text className="text-light-200">Longitude: {location.longitude.toFixed(6)}</Text>
            {location.formattedAddress && (
              <Text className="text-light-200">Address: {location.formattedAddress}</Text>
            )}
            <Text className="text-light-200">Time: {formatDate(location.timestamp)}</Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-white">Location History</Text>
            {isLoading && (
              <ActivityIndicator size="small" color="#A8B5DB" />
            )}
          </View>
          
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {locationHistory.map((location: LocationData, index: number) => (
              <View key={index} className="bg-dark-100 p-4 rounded-lg mb-3">
                <Text className="text-light-200">Latitude: {location.latitude.toFixed(6)}</Text>
                <Text className="text-light-200">Longitude: {location.longitude.toFixed(6)}</Text>
                {location.formattedAddress && (
                  <Text className="text-light-200">Address: {location.formattedAddress}</Text>
                )}
                <Text className="text-light-200">Time: {formatDate(location.timestamp)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default LocationScreen;
