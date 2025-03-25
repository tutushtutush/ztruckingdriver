import mockedAxiosInstance from "./jest.setup"; // Import mock before HttpContext
import HttpContext from "../services/HttpContext"; // Now import the module
import axios from "axios";

jest.mock("axios"); // Ensure Jest mocks axios

describe("HttpContext API Mocking", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("should return mocked user list when calling /users", async () => {
    (mockedAxiosInstance.post as jest.Mock).mockResolvedValueOnce({
      data: [{ id: 1, name: "John Doe" }],
    });
    (mockedAxiosInstance.post as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    const response = await HttpContext.POST("/auth/login", {
      email: "email",
      password: "password",
    });

    expect(response.data).toEqual([{ id: 1, name: "John Doe" }]);
    expect(mockedAxiosInstance.post).toHaveBeenCalledWith("/auth/login", {
      email: "email",
      password: "password",
    });
  });
});
