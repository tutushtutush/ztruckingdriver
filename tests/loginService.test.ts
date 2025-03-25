import { loginUser } from "@/services/loginService";
import HttpContext from "@/services/HttpContext"; // Import the real module
import { getAuthToken } from "@/services/authService";
import mockedAxiosInstance from "./jest.setup"; // Import mock before HttpContext

// Ensure Jest mocks axios
jest.mock("axios"); // Ensure Jest mocks axios
describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should return a token for valid credentials", async () => {
    (mockedAxiosInstance.post as jest.Mock).mockResolvedValueOnce({
      data: { token: "mocked-jwt-token", user: { email: "email" } },
    });
    (mockedAxiosInstance.post as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    const loginResponse = await loginUser("email", "password");

    expect(loginResponse).toEqual({
      token: "mocked-jwt-token",
      user: { email: "email" },
    });
  });

  it("should throw an error for invalid credentials", async () => {
    await expect(
      loginUser("wrong@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid credentials");
  });
});
