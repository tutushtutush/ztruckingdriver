import { UserApi } from '../api/user';
import { AsyncStorageService } from './asyncStorage';

export class UserService {
  constructor(userApi, asyncStorageSvc, errorTracker) {
    this.userApi = userApi || new UserApi();
    this.asyncStorageSvc = asyncStorageSvc || new AsyncStorageService();
    this.errorTracker = errorTracker;
  }

  async getUser() {
    try {
      // Try to get user from storage first
      const storedUser = await this.asyncStorageSvc.getItem('user');
      
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          if (this.errorTracker) {
            this.errorTracker.trackApiError(error, 'UserService/getUser', {
              method: 'GET',
              source: 'storage',
              hasStoredUser: true, // We have stored data, but it's invalid
            });
          }
          throw error;
        }
      }
      
      return null;
    } catch (error) {
      if (this.errorTracker) {
        this.errorTracker.trackApiError(error, 'UserService/getUser', {
          method: 'GET',
          source: 'storage',
          hasStoredUser: false, // No stored data or storage error
        });
      }
      throw error;
    }
  }
}
