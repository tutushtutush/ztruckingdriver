import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

// Mock AsyncStorage globally
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
import axios from "axios";

// Create a manual mock for Axios
const mockedAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

// Mock axios.create() to return our mocked instance
jest.mock("axios", () => ({
  create: jest.fn(() => mockedAxiosInstance), // Make sure axios.create returns mock
  isAxiosError: jest.fn(),
}));

export default mockedAxiosInstance;
