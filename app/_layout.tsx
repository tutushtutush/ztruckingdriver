import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="/app/screens/index.tsx"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="/app/screens/login.tsx"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="/app/screens/signUp.tsx"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
