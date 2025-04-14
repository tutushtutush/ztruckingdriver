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

const formatDate = (timestamp: number): string => {
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
    loadLocationHistory 
  } = useLocation();

  // Load location history when component mounts
  useEffect(() => {
    loadLocationHistory();
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <View className="items-center pt-8 pb-4">
        <Text className="text-xl font-bold mb-4">Location Tracking</Text>
        <Pressable onPress={() => isTracking ? stopTracking() : startTracking()}>
          <FontAwesome 
            name={isTracking ? "toggle-on" : "toggle-off"} 
            size={100} 
            color={isTracking ? "green" : "gray"} 
          />
        </Pressable>
      </View>

      {location && (
        <View className="p-4 mx-4 mb-4 bg-white rounded-lg shadow">
          <Text className="text-lg font-semibold mb-2">Current Location</Text>
          <Text>Latitude: {location.latitude.toFixed(6)}</Text>
          <Text>Longitude: {location.longitude.toFixed(6)}</Text>
          {location.formattedAddress && (
            <Text>Address: {location.formattedAddress}</Text>
          )}
          <Text>Time: {formatDate(location.timestamp)}</Text>
        </View>
      )}

      <View className="flex-1 px-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold">Location History</Text>
          {isLoading && (
            <ActivityIndicator size="small" color="#0000ff" />
          )}
        </View>
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {locationHistory.map((location: LocationData, index: number) => (
            <View key={index} className="p-3 mb-2 bg-white rounded-lg shadow">
              <Text>Latitude: {location.latitude.toFixed(6)}</Text>
              <Text>Longitude: {location.longitude.toFixed(6)}</Text>
              {location.formattedAddress && (
                <Text>Address: {location.formattedAddress}</Text>
              )}
              <Text>Time: {formatDate(location.timestamp)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default LocationScreen;
