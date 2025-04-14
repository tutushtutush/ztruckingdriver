export class UserService {
  constructor(userApi, asyncStorageSvc) {
    this.userApi = userApi;
    this.asyncStorageSvc = asyncStorageSvc;
  }

  async getUser() {
    try {
      // First, attempt to get the user from AsyncStorage
      const storedUser = await this.asyncStorageSvc.getItem(`user`);
      if (storedUser) {
        return JSON.parse(storedUser); // Return the user data from AsyncStorage if found
      }

      // If no user data is found in AsyncStorage, fetch from API
      return null

    } catch (error) {
      console.error('Error getting user data', error);
      throw error; // Rethrow error after logging it
    }
  }
}
