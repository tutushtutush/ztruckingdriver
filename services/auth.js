export class AuthService {
    constructor(authApi, authTokenSvc) {
      this.authApi = authApi;
      this.authTokenSvc = authTokenSvc;
    }

    async isTokenValid() {
        try {
          const token = this.authTokenSvc.getItem();
          if(!token) return false;

          return this.authApi.validateToken(token);
        } catch (error) {
          console.error('Error saving data to AsyncStorage', error);
          throw error;
        }
    }

    async signIn({email, password}) {
      try {
        const token = await this.authApi.login({ email, password });
        if(!token) return false;

        this.authTokenSvc.setItem(token);
      } catch (error) {
        console.error('Error saving data to AsyncStorage', error);
        throw error;
      }
    }

    singOut() {
        this.authTokenSvc.removeItem();
    }
}