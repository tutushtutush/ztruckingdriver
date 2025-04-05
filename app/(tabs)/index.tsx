import { Link } from "expo-router";
import { Text, View, Image, ScrollView, Button } from "react-native";
import { images } from "@/constants/images"
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import { useAuth } from '../../context/auth';

export default function Index() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"/>

      <ScrollView className="flex-1 px-5" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ minHeight:"100%", paddingBottom: 10}}>
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto"/>

        <View className="flex-1 mt-5">
          <Button
                    title={'Log out'}
                    onPress={handleLogout}
                  />
        </View>
      </ScrollView>
    </View>
  );
}
