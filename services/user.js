export class UserService {
  constructor(userApi, asyncStorageSvc) {
    this.userApi = userApi;
    this.asyncStorageSvc = asyncStorageSvc;
  }

  async getUser(userId) {
    try {
      // First, attempt to get the user from AsyncStorage
      const storedUser = await this.asyncStorageSvc.getItem(`user-${userId}`);
      if (storedUser) {
        return JSON.parse(storedUser); // Return the user data from AsyncStorage if found
      }

      // If no user data is found in AsyncStorage, fetch from API
      const userData = await this.userApi.getUser(userId);

      // Store the fetched user data in AsyncStorage for future use
      await this.asyncStorageSvc.setItem(`user-${userId}`, JSON.stringify(userData));

      return userData; // Return the user data from the API

    } catch (error) {
      console.error('Error getting user data', error);
      throw error; // Rethrow error after logging it
    }
  }
}
