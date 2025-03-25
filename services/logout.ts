import { removeAuthToken } from "./authService";

export const logoutUser = async () => {
  await removeAuthToken();
};
