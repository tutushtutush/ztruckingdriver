import { View, Text, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');

  // Simulated API login request
  const handleLogin = async () => {
    if (username.trim()) {
      const fakeToken = "abc123xyz"; // Simulated auth token from API
      const userData = { name: username };

      await login(userData, fakeToken);
      router.push('/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4 bg-gray-100">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        className="border w-full p-3 mb-4 bg-white rounded"
        placeholder="Enter your name"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default SignIn;
