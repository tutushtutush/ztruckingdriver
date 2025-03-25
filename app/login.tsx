import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { loginUser } from "@/services/loginService";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateInputs = () => {
    let isValid = true;
    let newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
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
      loginUser(email, password);
      router.push("./(tabs)/home");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <View className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <Text className="text-2xl font-bold text-center mb-6">Login</Text>

        <View>
          <Text className="text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-md w-full"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text className="text-red-500">{errors.email}</Text>
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
        </View>
      </View>
    </View>
  );
};

export default Login;
