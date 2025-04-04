import jwt_decode from 'jwt-decode'; // Import jwt-decode

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

  // Decode the token and get the user ID
  getUserIdFromToken(token) {
    try {
      const decoded = jwt_decode(token);
      return decoded.userId; // Adjust according to your token structure
    } catch (error) {
      console.error('Error decoding token', error);
      throw new Error('Invalid token');
    }
  }

  // Sign in method to save token in AsyncStorage
  async signIn({ email, password }) {
    try {
      const token = await this.authApi.login({ email, password });
      if (!token) return false;

      await this.asyncStorageSvc.setItem('authToken', token);
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
    } catch (error) {
      console.error('Error during sign-out', error);
    }
  }

  async clearAllStorage() {
    try {
      await this.asyncStorageSvc.clearAllStorage(); // Using the method from AsyncStorageService
      console.log('AsyncStorage cleared successfully!');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }
}
