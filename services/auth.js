export class AuthService {
    constructor(authApiSvc, authTokenSvc) {
      this.authApiSvc = authApiSvc;
      this.authTokenSvc = authTokenSvc;
    }

    async isTokenValid() {
        try {
          const token = this.authTokenSvc.getItem();
          if(!token) return false;

          return this.authApiSvc.validateToken(token);
        } catch (error) {
          console.error('Error saving data to AsyncStorage', error);
          throw error;
        }
    }

    async signIn({email, password}) {
      try {
        const token = await this.authApiSvc.login({ email, password });
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