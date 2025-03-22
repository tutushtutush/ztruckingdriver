import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const validateInputs = () => {
    let isValid = true;
    let newErrors = { username: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (validateInputs()) {
      console.log("Login successful", username, password);
      router.push("./(tabs)/home");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <View className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <Text className="text-2xl font-bold text-center mb-6">Login</Text>

        <View>
          <Text className="text-gray-700 mb-1">Username</Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-md w-full"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
          />
          {errors.username ? (
            <Text className="text-red-500">{errors.username}</Text>
          ) : null}

          <Text className="text-gray-700 mt-3 mb-1">Password</Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-md w-full"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password ? (
            <Text className="text-red-500">{errors.password}</Text>
          ) : null}

          <TouchableOpacity
            className="bg-blue-500 mt-4 py-3 rounded-md"
            onPress={handleLogin}
          >
            <Text className="text-white text-center font-bold">Login</Text>
          </TouchableOpacity>

          {/* Using Link for navigation */}
        </View>
      </View>
    </View>
  );
};

export default Login;
