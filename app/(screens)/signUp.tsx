import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { Link, useRouter } from "expo-router";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    code: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const router = useRouter();

  const validateInputs = () => {
    let isValid = true;
    let newErrors = { username: "", email: "", password: "", code: "" };

    const usernameRegex = /^[a-zA-Z_]{5,10}$/;
    if (!username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username must be 5-10 characters (letters & underscores only)";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (isCodeSubmitted && !code.trim()) {
      newErrors.code = "Please enter the code sent to your email";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (validateInputs()) {
      setIsSubmitting(true);

      setTimeout(() => {
        setModalVisible(true);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleCodeSubmit = () => {
    if (code === "123456") {
      setIsCodeVerified(true);
    } else {
      setErrors({ ...errors, code: "Invalid code. Please try again." });
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <View className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <Text className="text-2xl font-bold text-center mb-6">Sign Up</Text>

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

          <Text className="text-gray-700 mt-3 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 p-3 rounded-md w-full"
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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
            className="bg-green-500 mt-4 py-3 rounded-md"
            onPress={handleSignUp}
            disabled={isSubmitting}
          >
            <Text className="text-white text-center font-bold">
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Link
            href="/(screens)/login"
            className="mt-3 text-blue-500 text-center"
          >
            Already have an account? Sign In
          </Link>
        </View>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-6 rounded-lg shadow-lg w-80">
            {isCodeVerified ? (
              <>
                <Text className="text-green-500 text-lg font-bold text-center">
                  Sign Up Successful!
                </Text>

                <TouchableOpacity
                  className="bg-green-500 mt-4 py-3 rounded-md"
                  onPress={() => router.push("(screens)/login")}
                >
                  <Text className="text-white text-center font-bold">OK</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-blue-500 text-lg font-bold text-center">
                  We have sent a code to your email. Please enter the code:
                </Text>

                <TextInput
                  className="border border-gray-300 p-3 rounded-md w-full mt-4"
                  placeholder="Enter the code"
                  value={code}
                  onChangeText={setCode}
                />
                {errors.code ? (
                  <Text className="text-red-500 mt-2">{errors.code}</Text>
                ) : null}

                <TouchableOpacity
                  className="bg-green-500 mt-4 py-3 rounded-md"
                  onPress={handleCodeSubmit}
                >
                  <Text className="text-white text-center font-bold">
                    Verify Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="mt-4 p-2 rounded-md border border-gray-300 bg-gray-200"
                >
                  <Text className="text-center text-gray-700 font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignUp;
