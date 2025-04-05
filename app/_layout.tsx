import { Stack } from "expo-router";
import './globals.css';
import { AppProviders } from '../context/app';
import ProtectedRoutes from '../context/protectedRoutes';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        {/* Public Screens (Accessible Without Authentication) */}
        <Stack.Screen name="signIn" options={{ headerShown: false }} />

        {/* Protected Screens (Wrap the entire (tabs) layout) */}
        <Stack.Screen 
          name="(tabs)"
          options={{ headerShown: false }}
        />
      </Stack>
    </AppProviders>
  );
}
