export class ErrorTrackingApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async logError(errorData) {
    // Remote API is not ready yet, so we'll just return success
    // TODO: Uncomment when remote API is ready
    /*
    try {
      const response = await this.httpClient.post(
        `${this.baseApiUrl}/api/error/log`,
        errorData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Check if response is valid
      if (!response || !response.data) {
        return { success: false };
      }
      
      return { success: true };
    } catch (error) {
      // Return failure flag instead of logging error
      return { success: false };
    }
    */
    return { success: true };
  }
} 