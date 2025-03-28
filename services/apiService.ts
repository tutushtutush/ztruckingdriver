import HttpContext from "./HttpContext";

export const getData = async (endpoint: string) => {
  try {
    const response = await HttpContext.GET(endpoint);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    throw error;
  }
};
