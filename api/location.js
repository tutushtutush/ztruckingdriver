export class LocationApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async sendLocationData(locationData, token) {
    try {
      const response = await this.httpClient.post(
        `${this.baseApiUrl}/api/location/track`,
        locationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending location data:', error);
      throw error;
    }
  }

  async getLocationHistory(token) {
    try {
      const response = await this.httpClient.get(
        `${this.baseApiUrl}/api/location/history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching location history:', error);
      throw error;
    }
  }
} 