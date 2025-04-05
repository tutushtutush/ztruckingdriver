export class AuthApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async login({ profileEmail, profilePassword }) {
    try {
      const response = await this.httpClient.post(
        `${this.baseApiUrl}/api/user_profile/login`,
        { profileEmail, profilePassword }
      );

      // Normalize header access
      const token = response.headers?.authorization || response.headers?.Authorization;
      const userData = response.data;

      if (!token) {
        throw new Error('No auth token returned from login');
      }

      return { token, userData };
    } catch (error) {
      console.error('[AuthApi.login] Login failed:', error);

      // Forward structured message for UI
      throw new Error(error.response?.data?.message || 'Login failed');
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
      console.error('[AuthApi.validateToken] Token validation failed:', error);
      return false;
    }
  }
}
