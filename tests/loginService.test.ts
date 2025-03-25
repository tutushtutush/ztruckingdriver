import { loginUser } from "@/services/loginService";
import HttpContext from "@/services/HttpContext"; // Import the real module

jest.mock("@/services/HttpContext", () => ({
  POST: jest.fn(), // Mock only the POST method
}));

describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should return a token for valid credentials", async () => {
    (HttpContext.POST as jest.Mock).mockResolvedValueOnce({
      data: { token: "mocked-jwt-token", user: { email: "email" } },
    });

    const response = await loginUser("email", "password");

    expect(response).toHaveProperty("token", "mocked-jwt-token");
    expect(response.user.email).toBe("email");
    expect(HttpContext.POST).toHaveBeenCalledWith("/auth/login", {
      email: "email",
      password: "password",
    });
  });

  it("should throw an error for invalid credentials", async () => {
    (HttpContext.POST as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    await expect(
      loginUser("wrong@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid credentials");

    expect(HttpContext.POST).toHaveBeenCalledWith("/auth/login", {
      email: "email",
      password: "password",
    });
  });
});
