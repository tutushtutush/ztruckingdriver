import { Link, useRouter } from "expo-router";
import { Text, View, Image, ScrollView, Pressable } from "react-native";
import { images } from "@/constants/images"
import { icons } from "@/constants/icons";
import { useAuth } from "../../context/auth";
import { useLocation } from "../../context/location";
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface QuickActionCardProps {
  icon: keyof typeof FontAwesome.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
}

const QuickActionCard = ({ icon, title, onPress, color = "#A8B5DB" }: QuickActionCardProps) => (
  <Pressable 
    onPress={onPress}
    className="bg-dark-100 p-4 rounded-lg flex-1 mx-2"
  >
    <View className="items-center">
      <FontAwesome name={icon} size={24} color={color} />
      <Text className="text-light-200 mt-2 text-center">{title}</Text>
    </View>
  </Pressable>
);

export default function Index() {
  const { user } = useAuth();
  const { isTracking, startTracking, stopTracking, locationHistory } = useLocation();
  const router = useRouter();

  // Get the most recent location if available
  const recentLocation = locationHistory[0];

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0 opacity-30"/>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with Logo and Welcome */}
        <View className="items-center mt-20 mb-8">
          <Image source={icons.logo} className="w-12 h-10 mb-4"/>
          <Text className="text-2xl font-bold text-white">
            Welcome, {user?.driverInfo?.contact?.firstName || 'Driver'}
          </Text>
          <Text className="text-light-200 text-center mt-2">
            Track your location and manage your deliveries
          </Text>
        </View>

        {/* Location Status Card */}
        <View className="bg-dark-100 p-4 rounded-lg mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-white">Location Status</Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-green-500' : 'bg-red-500'}`} />
              <Text className="text-light-200">{isTracking ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
          
          {recentLocation && (
            <View>
              <Text className="text-light-200">Last Location:</Text>
              <Text className="text-light-200">Lat: {recentLocation.latitude.toFixed(6)}</Text>
              <Text className="text-light-200">Long: {recentLocation.longitude.toFixed(6)}</Text>
              {recentLocation.formattedAddress && (
                <Text className="text-light-200">Address: {recentLocation.formattedAddress}</Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-white mb-4">Quick Actions</Text>
        <View className="flex-row mb-6">
          <QuickActionCard 
            icon={isTracking ? "toggle-on" : "toggle-off"} 
            title={isTracking ? "Stop Tracking" : "Start Tracking"}
            onPress={() => isTracking ? stopTracking() : startTracking()}
            color={isTracking ? "#4CAF50" : "#A8B5DB"}
          />
          <QuickActionCard 
            icon="history" 
            title="Location History"
            onPress={() => router.push('/location')}
          />
          <QuickActionCard 
            icon="user" 
            title="Profile"
            onPress={() => router.push('/profile')}
          />
        </View>

        {/* Carrier Information */}
        <View className="bg-dark-100 p-4 rounded-lg mb-6">
          <Text className="text-lg font-semibold text-white mb-4">Carrier Information</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <FontAwesome name="building" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">Company: {user?.carrier?.prettyName || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View className="bg-dark-100 p-4 rounded-lg">
          <Text className="text-lg font-semibold text-white mb-4">Driver Information</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <FontAwesome name="user" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">Name: {user?.driverInfo?.driver?.prettyName || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="truck" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">Type: {user?.driverInfo?.driverType || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="id-card" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">ID: {user?.driverInfo?.driver?.id || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="phone" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">Phone: {user?.driverInfo?.contact?.phoneNumber || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="envelope" size={20} color="#A8B5DB" />
              <Text className="text-light-200 ml-3">Email: {user?.driverInfo?.contact?.email || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
