export class LocationApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async sendLocationData(locationData, token) {
    try {
      const url = `${this.baseApiUrl}/d_api/location_update_app/`;
      const cleanToken = token.replace(/"/g, '');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      };
      
      const response = await this.httpClient.post(
        url,
        locationData,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending location data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
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