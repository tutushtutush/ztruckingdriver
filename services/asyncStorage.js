export class AsyncStorageService {
  constructor(asyncStorage, errorTracker) {
      if (!asyncStorage || typeof asyncStorage.setItem !== 'function' || 
          typeof asyncStorage.getItem !== 'function' || 
          typeof asyncStorage.removeItem !== 'function') {
          throw new Error('Invalid asyncStorage instance provided.');
      }

      this.asyncStorage = asyncStorage;
      this.errorTracker = errorTracker;
  }

  async setItem(key, value) {
      try {
          if (key === 'authToken') {
              await this.asyncStorage.setItem(key, value);
          } else {
              await this.asyncStorage.setItem(key, JSON.stringify(value));
          }
      } catch (error) {
          if (this.errorTracker) {
              await this.errorTracker.trackApiError(error, 'AsyncStorage/setItem', {
                  method: 'SET',
                  key,
                  value: key === 'authToken' ? '***' : value, // Mask sensitive data
              });
          }
          throw error;
      }
  }

  async getItem(key) {
      try {
          const value = await this.asyncStorage.getItem(key);
          if (!value) return null;
          
          if (key === 'authToken') {
              return value;
          }
          return JSON.parse(value);
      } catch (error) {
          if (this.errorTracker) {
              await this.errorTracker.trackApiError(error, 'AsyncStorage/getItem', {
                  method: 'GET',
                  key,
              });
          }
          throw error;
      }
  }

  async removeItem(key) {
      try {
          await this.asyncStorage.removeItem(key);
      } catch (error) {
          if (this.errorTracker) {
              await this.errorTracker.trackApiError(error, 'AsyncStorage/removeItem', {
                  method: 'REMOVE',
                  key,
              });
          }
          throw error;
      }
  }

  async clearAllStorage() {
      try {
          await this.asyncStorage.clear();
      } catch (error) {
          if (this.errorTracker) {
              await this.errorTracker.trackApiError(error, 'AsyncStorage/clearAll', {
                  method: 'CLEAR',
              });
          }
          throw error;
      }
  }
}
