class AuthTokenService {
    constructor(asyncStorage) {
      this.asyncStorage = asyncStorage;
    }
  
    async setItem(key, value) {
      try {
        await this.asyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving data to AsyncStorage', error);
        throw error;
      }
    }
  
    async getItem(key) {
      try {
        const value = await this.asyncStorage.getItem(key);
        return value;
      } catch (error) {
        console.error('Error fetching data from AsyncStorage', error);
        throw error;
      }
    }
  
    async removeItem(key) {
      try {
        await this.asyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing data from AsyncStorage', error);
        throw error;
      }
    }
  }
  
  module.exports = AuthTokenService;
  