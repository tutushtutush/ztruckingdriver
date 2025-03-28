import { loginUser } from "@/services/authService";
import mockedAxiosInstance from "./jest.setup";

jest.mock("axios");
describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a token for valid credentials", async () => {
    (mockedAxiosInstance.post as jest.Mock).mockResolvedValueOnce({
      data: { token: "mocked-jwt-token", user: { email: "email" } },
    });
    const loginResponse = await loginUser("email", "password");

    expect(loginResponse).toEqual({
      token: "mocked-jwt-token",
      user: { email: "email" },
    });
  });

  it("should throw an error for invalid credentials", async () => {
    (mockedAxiosInstance.post as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Unauthorized" } },
    });
    await expect(
      loginUser("wrong@example.com", "wrongpassword")
    ).rejects.toThrow("Unauthorized");
  });

  it("should throw error if token is not found when loging", async () => {
    (mockedAxiosInstance.post as jest.Mock).mockRejectedValue({
      response: { status: 401, data: { message: "Unauthorized" } },
    });

    await expect(
      loginUser("wrong@example.com", "wrongpassword")
    ).rejects.toThrow("Unauthorized");

    expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/login", {
      email: "wrong@example.com",
      password: "wrongpassword",
    });
  });
});
