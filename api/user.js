export class UserApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async getUser(userId) {
    try {
      if(!userId) {
        throw new Error('User Id is required!');
      }

      const response = await this.httpClient.get(`${this.baseApiUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('getUser > request failed:', error);
      throw error;
    }
  }
}
  