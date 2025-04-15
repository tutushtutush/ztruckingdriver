export class AuthService {
  constructor(authApi, asyncStorageSvc) {
    this.authApi = authApi;
    this.asyncStorageSvc = asyncStorageSvc;
  }

  // Get token from AsyncStorage
  async getToken() {
    try {
      return await this.asyncStorageSvc.getItem('authToken');
    } catch (error) {
      console.error('Error getting token', error);
      throw error;
    }
  }

  // Set remembered username
  async setRememberedUsername(username) {
    try {
      await this.asyncStorageSvc.setItem('rememberedUsername', username);
    } catch (error) {
      console.error('Error setting remembered username', error);
      throw error;
    }
  }

  // Get remembered username
  async getRememberedUsername() {
    try {
      return await this.asyncStorageSvc.getItem('rememberedUsername');
    } catch (error) {
      console.error('Error getting remembered username', error);
      throw error;
    }
  }

  // Remove remembered username
  async removeRememberedUsername() {
    try {
      await this.asyncStorageSvc.removeItem('rememberedUsername');
    } catch (error) {
      console.error('Error removing remembered username', error);
      throw error;
    }
  }

  // Validate the token
  async isTokenValid() {
    try {
      const token = await this.getToken();
      if (!token) return false;
      return await this.authApi.validateToken(token);
    } catch (error) {
      console.error('Error validating token', error);
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
      console.error('Error during sign-in', error);
      throw error;
    }
  }

  // Sign out method to remove token from AsyncStorage
  async signOut() {
    try {
      await this.asyncStorageSvc.removeItem('authToken');
      await this.asyncStorageSvc.removeItem('user');
    } catch (error) {
      console.error('Error during sign-out', error);
    }
  }

  // Clear all storage
  async clearAllStorage() {
    try {
      await this.asyncStorageSvc.clearAllStorage();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
}
