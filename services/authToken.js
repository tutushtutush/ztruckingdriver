class AuthTokenService {
    constructor(asyncStorage) {
      this.asyncStorage = asyncStorage;
      this.key = 'userToken';
    }
  
    async setItem(value) {
      try {
        await this.asyncStorage.setItem(this.key, value);
      } catch (error) {
        console.error('Error saving data to AsyncStorage', error);
        throw error;
      }
    }
  
    async getItem() {
      try {
        const value = await this.asyncStorage.getItem(this.key);
        return value;
      } catch (error) {
        console.error('Error fetching data from AsyncStorage', error);
        throw error;
      }
    }
  
    async removeItem() {
      try {
        await this.asyncStorage.removeItem(this.key);
      } catch (error) {
        console.error('Error removing data from AsyncStorage', error);
        throw error;
      }
    }
  }
  
  module.exports = AuthTokenService;
  