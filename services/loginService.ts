import { setAuthToken } from "./authService";
import HttpContext from "./HttpContext";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await HttpContext.POST(`/auth/login`, {
      email: "email",
      password: "password",
    });
    if (response.data?.token) {
      await setAuthToken(response.data.token);
      return response.data;
    } else {
      throw new Error("Invalid login response");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
