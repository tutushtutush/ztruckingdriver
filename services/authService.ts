import { setAuthToken, removeAuthToken } from "./tokenService";
import HttpContext from "./HttpContext";
import { Router } from "expo-router";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await HttpContext.POST(`/auth/login`, {
      email: email,
      password: password,
    });
    if (response.data?.token) {
      await setAuthToken(response.data.token);
      return response.data;
    } else if (!response.data?.token) {
      throw { response: { data: { message: "Unable to login" } } };
    }
  } catch (error: any) {
    throw new Error(`${error.response.data.message}`);
  }
};

export const logoutUser = async () => {
  await removeAuthToken();
};
