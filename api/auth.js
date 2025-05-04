export class AuthApi {
  constructor(httpClient, baseApiUrl, errorTracker) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
    this.errorTracker = errorTracker;
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
        const error = new Error('No auth token returned from login');
        if (this.errorTracker) {
          await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/api/user_profile/login/`, {
            method: 'POST',
            data: { profileEmail: '***' }, // Mask sensitive data
          });
        }
        throw error;
      }

      return { token, userData };
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/api/user_profile/login/`, {
          method: 'POST',
          data: { profileEmail: '***' }, // Mask sensitive data
          response: error.response?.data,
          status: error.response?.status,
        });
      }

      // Forward structured message for UI with additional fallback
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  async validateToken(token) {
    if (!token) {
      const error = new Error('No token provided');
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/auth/validate`, {
          method: 'GET',
        });
      }
      throw error;
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
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, `${this.baseApiUrl}/auth/validate`, {
          method: 'GET',
          response: error.response?.data,
          status: error.response?.status,
        });
      }

      // Forward a more informative error for token validation failure
      throw new Error(error.response?.data?.message || 'Token validation failed');
    }
  }
}
