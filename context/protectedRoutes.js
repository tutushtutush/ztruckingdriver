import { useRouter } from 'expo-router';
import { useAuth } from './auth';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

const ProtectedRoutes = ({ children }) => {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('protected routes', token)
    if (!loading && !token) {
      router.replace('/signIn'); // Ensures navigation happens outside render
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  if (!token) {
    return null; // Prevent rendering protected content before redirecting
  }

  return children;
};

export default ProtectedRoutes;
