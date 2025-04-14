export class AuthApi {
  constructor(httpClient, baseApiUrl) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
  }

  async login({ profileEmail, profilePassword }) {
    try {
      const response = await this.httpClient.post(
        `${this.baseApiUrl}/api/user_profile/login/`,
        { profileEmail, profilePassword },
        {
          headers: {
            'Content-Type': 'application/json', // Ensure the server understands the body as JSON
          },
        }
      );

      // Normalize header access for token
      const token = response.headers?.authorization || response.headers?.Authorization;
      const userData = response.data;

      if (!token) {
        throw new Error('No auth token returned from login');
      }

      return { token, userData };
    } catch (error) {
      console.error('[AuthApi.login] Login failed:', error);

      // Forward structured message for UI with additional fallback
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async validateToken(token) {
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const response = await this.httpClient.get(`${this.baseApiUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Ensure the server understands the request as JSON
        },
      });

      if (response?.data?.valid) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('[AuthApi.validateToken] Token validation failed:', error);

      // Forward a more informative error for token validation failure
      throw new Error(error.response?.data?.message || 'Token validation failed');
    }
  }
}
