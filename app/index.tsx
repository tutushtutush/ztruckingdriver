import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl text-primary font-bold">Ztrucking</Text>
      <Link href="/screens/login">Login</Link>
      <Link href="/screens/signUp">SignUp</Link>
    </View>
  );
}
