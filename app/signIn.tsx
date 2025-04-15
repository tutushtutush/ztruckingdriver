import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { images } from '@/constants/images';
import { icons } from '@/constants/icons';
import { Image } from 'react-native';

const SignIn = () => {
  const { login, rememberedUsername } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load remembered username when component mounts
  useEffect(() => {
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, [rememberedUsername]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');
    const authData = { 
      profileEmail: username.trim(), 
      profilePassword: password,
      rememberMe 
    };

    const success = await login(authData);
    setLoading(false);
    if(!success) {
      setError('Invalid username or password');
    } else {
      router.push('/(tabs)');
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log('Forgot password pressed');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-primary">
          <Image source={images.bg} className="absolute w-full h-full z-0 opacity-30"/>
          
          <View className="flex-1 px-5 pt-8">
            <View className="items-center mb-8">
              <Image 
                source={icons.logo} 
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-white">Welcome Back</Text>
              <Text className="text-light-200 text-center mt-2">Sign in to continue tracking your location</Text>
            </View>

            {error ? (
              <View className="bg-red-500/20 p-3 rounded-lg mb-6 flex-row items-center">
                <FontAwesome name="exclamation-circle" size={20} color="#ff6b6b" />
                <Text className="text-red-400 ml-3 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="bg-dark-100 p-4 rounded-lg mb-4">
              <View className="flex-row items-center mb-3 border-b border-gray-700 pb-2">
                <FontAwesome name="user" size={20} color="#A8B5DB" />
                <TextInput
                  className="flex-1 text-light-200 text-lg ml-3"
                  placeholder="Username"
                  placeholderTextColor="#6B7280"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setError('');
                  }}
                  returnKeyType="next"
                />
              </View>

              <View className="flex-row items-center border-b border-gray-700 pb-2">
                <FontAwesome name="lock" size={20} color="#A8B5DB" />
                <TextInput
                  className="flex-1 text-light-200 text-lg ml-3"
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={20} 
                    color="#A8B5DB" 
                  />
                </Pressable>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <Pressable 
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center"
              >
                <FontAwesome 
                  name={rememberMe ? "check-square" : "square-o"} 
                  size={20} 
                  color="#A8B5DB" 
                />
                <Text className="text-light-200 ml-2">Remember me</Text>
              </Pressable>

              <Pressable onPress={handleForgotPassword}>
                <Text className="text-blue-400">Forgot Password?</Text>
              </Pressable>
            </View>

            <Pressable 
              onPress={handleLogin}
              disabled={loading}
              className="flex-row items-center justify-center bg-dark-100 p-4 rounded-lg"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#A8B5DB" />
              ) : (
                <>
                  <FontAwesome name="sign-in" size={24} color="#A8B5DB" />
                  <Text className="text-light-200 text-lg ml-4">Sign In</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
