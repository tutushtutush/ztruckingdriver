import { View, Text, Pressable } from 'react-native';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocation } from '../../context/location';

const LocationScreen = () => {
  const { locationOn, setLocationOn } = useLocation();

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-xl font-bold mb-4">Location</Text>
      <Pressable onPress={() => setLocationOn(!locationOn)}>
        <FontAwesome 
          name={locationOn ? "toggle-on" : "toggle-off"} 
          size={100} 
          color={locationOn ? "green" : "gray"} 
        />
      </Pressable>
    </View>
  );
};

export default LocationScreen;
