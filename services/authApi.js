// authService.js
export class AuthServiceService {
    constructor(httpClient) {
      this.httpClient = httpClient;
    }
  
    async login(credentials) {
      try {
        const response = await this.httpClient.post('/auth/login', credentials);
        return response.data.token;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    }
  
    async validateToken(token) {
      if (!token) {
        throw new Error('No token provided');
      }
      
      try {
        const response = await this.httpClient.get('/auth/validate', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.valid;
      } catch (error) {
        console.error('Token validation failed:', error);
        return false;
      }
    }
  }
  