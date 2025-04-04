import { View, Text, TextInput, Button, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated API login request
  const handleLogin = async () => {
    console.log('handleLogin')
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    // setLoading(true);
    // setError('');
    // const fakeToken = 'abc123xyz'; // Simulated auth token from API
    // const userData = { name: username };

    // await login(userData, fakeToken);
    // setLoading(false);
    // router.push('/(tabs)');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center items-center p-4 bg-gray-100">
        <Text className="text-2xl font-bold mb-4">Login</Text>

        {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

        <TextInput
          className="border w-full p-3 mb-4 bg-white rounded"
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          className="border w-full p-3 mb-4 bg-white rounded"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignIn;
