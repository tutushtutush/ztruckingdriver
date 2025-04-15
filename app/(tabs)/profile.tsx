import { View, Text, Pressable, Image, ScrollView } from 'react-native';
import React from 'react';
import { useAuth } from '../../context/auth';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Profile = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/signIn');
  };

  // Parse address string if it exists
  const address = user?.address ? JSON.parse(user.address) : null;

  return (
    <View className="flex-1 bg-primary">
      <View className="px-5 pt-8">
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-2xl font-bold text-white">Profile</Text>
          <Pressable 
            onPress={handleLogout}
            className="flex-row items-center bg-dark-100 px-4 py-2 rounded-lg"
          >
            <FontAwesome name="sign-out" size={20} color="#A8B5DB" />
            <Text className="text-light-200 ml-2">Log Out</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Carrier Info */}
        <View className="bg-dark-100 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-white mb-4">Carrier Information</Text>
          
          {user?.carrier?.carrierProfilePicture && (
            <View className="items-center mb-4">
              <Image 
                source={{ uri: user.carrier.carrierProfilePicture }}
                className="w-20 h-20 rounded-full"
              />
            </View>
          )}

          <View className="flex-row items-center mb-3">
            <FontAwesome name="building" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.carrier?.prettyName || 'Carrier not set'}
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        <View className="bg-dark-100 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-white mb-4">Driver Information</Text>
          
          <View className="flex-row items-center mb-3">
            <FontAwesome name="user" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.driverInfo?.driver?.prettyName || 'Name not set'}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="id-card" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.driverInfo?.driver?.id || 'ID not set'}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="envelope" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.driverInfo?.contact?.email || 'Email not set'}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="phone" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.driverInfo?.contact?.phoneNumber || 'Phone not set'}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="truck" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              {user?.driverInfo?.driverType || 'Driver Type not set'}
            </Text>
          </View>
        </View>

        {/* Address Info */}
        {address && (
          <View className="bg-dark-100 p-4 rounded-lg mb-6">
            <Text className="text-lg font-semibold text-white mb-4">Address</Text>
            
            <View className="flex-row items-center mb-3">
              <FontAwesome name="map-marker" size={20} color="#A8B5DB" />
              <Text className="text-light-200 text-lg ml-3">
                {address.place}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <FontAwesome name="map" size={20} color="#A8B5DB" />
              <Text className="text-light-200 text-lg ml-3">
                {address.city}, {address.state} {address.zipCode}
              </Text>
            </View>
          </View>
        )}

        {/* Subscription Info */}
        <View className="bg-dark-100 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-white mb-4">Subscription</Text>
          
          <View className="flex-row items-center mb-3">
            <FontAwesome name="credit-card" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              Type: {user?.subscription?.profileSubscriptionType || 'Not set'}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="calendar" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              Next Payment: {user?.subscription?.nextPaymentDate || 'Not set'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <FontAwesome name="check-circle" size={20} color="#A8B5DB" />
            <Text className="text-light-200 text-lg ml-3">
              Status: {user?.subscription?.subscriptionStatus || 'Not set'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;