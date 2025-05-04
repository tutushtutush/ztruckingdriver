export class LocationApi {
  constructor(httpClient, baseApiUrl, errorTracker) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
    this.errorTracker = errorTracker;
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
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/d_api/location_update_app/`, {
          method: 'POST',
          data: {
            ...locationData,
            token: '***', // Mask sensitive data
          },
          response: error.response?.data,
          status: error.response?.status,
        });
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
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/api/location/history`, {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ***', // Mask sensitive data
          },
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw error;
    }
  }
} 