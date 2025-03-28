import AsyncStorage from "@react-native-async-storage/async-storage";

export const setAuthToken = async (authToken: string) => {
  try {
    await AsyncStorage.setItem("userToken", authToken);
  } catch (error) {
    console.error("AsyncStorage token store error:", error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("AsyncStorage token retrieval error:", error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
  } catch (error) {
    console.error("AsyncStorage token removal error:", error);
  }
};
