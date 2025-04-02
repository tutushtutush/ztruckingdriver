export class UserService {
    constructor(userApi) {
        this.userApi = userApi;
    };

    async getUser(userId) {
        try {
            return await this.userApi.getUser(userId);
          } catch (error) {
            console.error('Error getting user data', error);
            throw error;
          }
    };
}