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

  // Validate the token (No decoding here, just validate using the backend)
  async isTokenValid() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      return await this.authApi.validateToken(token); // Assumes backend will validate
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

      // Store both token and user data in AsyncStorage
      await this.asyncStorageSvc.setItem('authToken', token);
      await this.asyncStorageSvc.setItem('user', userData);

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

  // Clear all data from AsyncStorage
  async clearAllStorage() {
    try {
      await this.asyncStorageSvc.clearAllStorage(); // Using the method from AsyncStorageService
      console.log('AsyncStorage cleared successfully!');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }
}
