import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { router } from "expo-router";
if (!API_BASE_URL) {
  throw "API_BASE_URL missing in environment variable";
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("/auth/login")) {
      return config;
    }

    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      router.replace("/login");
      return Promise.reject({
        response: {
          status: 401,
          data: { message: "Unauthorized: Token is required" },
        },
      });
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const HttpContext = {
  GET: async (endpoint: string) => {
    return apiClient.get(endpoint);
  },
  POST: async (endpoint: string, data: any) => {
    return apiClient.post(endpoint, data);
  },
  PUT: async (endpoint: string, data: any) => {
    return apiClient.put(endpoint, data);
  },
  DELETE: async (endpoint: string) => {
    return apiClient.delete(endpoint);
  },
};

export default HttpContext;
