import { getData } from "@/services/apiService";
import HttpContext from "@/services/HttpContext";
import mockedAxiosInstance from "./jest.setup";

jest.mock("axios");
describe("loginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return data for /data/auth endpoint", async () => {
    (mockedAxiosInstance.get as jest.Mock).mockResolvedValueOnce({
      data: "home page data",
    });
    const loginResponse = await getData("/data/home");
    expect(loginResponse).toEqual("home page data");
    expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/data/home");
  });
});
