// authApi.js
export class AuthApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async login(credentials) {
    try {
      const response = await this.httpClient.post(`${this.baseApiUrl}/auth/login`, credentials);
      return response.data.token;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async validateToken(token) {
    if (!token) {
      throw new Error('No token provided');
    }
    
    try {
      const response = await this.httpClient.get(`${this.baseApiUrl}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}
  