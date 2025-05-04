export class AuthService {
  constructor(authApi, asyncStorageSvc, errorTracker) {
    this.authApi = authApi;
    this.asyncStorageSvc = asyncStorageSvc;
    this.errorTracker = errorTracker;
  }

  // Get token from AsyncStorage
  async getToken() {
    try {
      return await this.asyncStorageSvc.getItem('authToken');
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/getToken', {
          method: 'GET',
          key: 'authToken',
        });
      }
      throw error;
    }
  }

  // Set remembered username
  async setRememberedUsername(username) {
    try {
      await this.asyncStorageSvc.setItem('rememberedUsername', username);
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/setRememberedUsername', {
          method: 'SET',
          key: 'rememberedUsername',
          value: username,
        });
      }
      throw error;
    }
  }

  // Get remembered username
  async getRememberedUsername() {
    try {
      return await this.asyncStorageSvc.getItem('rememberedUsername');
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/getRememberedUsername', {
          method: 'GET',
          key: 'rememberedUsername',
        });
      }
      throw error;
    }
  }

  // Remove remembered username
  async removeRememberedUsername() {
    try {
      await this.asyncStorageSvc.removeItem('rememberedUsername');
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/removeRememberedUsername', {
          method: 'REMOVE',
          key: 'rememberedUsername',
        });
      }
      throw error;
    }
  }

  // Validate the token
  async isTokenValid() {
    let token = null;
    try {
      token = await this.getToken();
      if (!token) return false;
      return await this.authApi.validateToken(token);
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/isTokenValid', {
          method: 'VALIDATE',
          hasToken: !!token,
        });
      }
      return false;
    }
  }

  // Sign in method to save token in AsyncStorage
  async signIn({ profileEmail, profilePassword }) {
    try {
      const { token, userData } = await this.authApi.login({ profileEmail, profilePassword });
      if (!token || !userData) return false;

      // Store token and user data in AsyncStorage
      await this.asyncStorageSvc.setItem('authToken', token);
      await this.asyncStorageSvc.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/signIn', {
          method: 'LOGIN',
          hasEmail: !!profileEmail,
          hasPassword: !!profilePassword,
        });
      }
      throw error;
    }
  }

  // Sign out method to remove token from AsyncStorage
  async signOut() {
    try {
      await this.asyncStorageSvc.removeItem('authToken');
      await this.asyncStorageSvc.removeItem('user');
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/signOut', {
          method: 'LOGOUT',
        });
      }
      throw error;
    }
  }

  // Clear all storage
  async clearAllStorage() {
    try {
      await this.asyncStorageSvc.clearAllStorage();
    } catch (error) {
      if (this.errorTracker) {
        await this.errorTracker.trackApiError(error, 'AuthService/clearAllStorage', {
          method: 'CLEAR',
        });
      }
      throw error;
    }
  }
}
