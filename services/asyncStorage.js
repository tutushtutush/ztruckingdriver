export class AsyncStorageService {
  constructor(asyncStorage) {
      if (!asyncStorage || typeof asyncStorage.setItem !== 'function' || 
          typeof asyncStorage.getItem !== 'function' || 
          typeof asyncStorage.removeItem !== 'function') {
          throw new Error('Invalid asyncStorage instance provided.');
      }

      this.asyncStorage = asyncStorage;
  }

  async setItem(key, value) {
      try {
          await this.asyncStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
          console.error('Error saving data to AsyncStorage', error);
          throw error;
      }
  }

  async getItem(key) {
      try {
          const value = await this.asyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
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

   async clearAllStorage() {
    try {
      await this.asyncStorage.clear();
      console.log('AsyncStorage cleared successfully!');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  };
}
