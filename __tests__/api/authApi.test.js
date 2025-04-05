import { AuthApi } from '../../api/auth'; // Import the class you're testing

// Mock the httpClient (instead of axios)
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

describe('AuthApi', () => {
  let authApi;
  const baseApiUrl = 'http://api.example.com';

  beforeEach(() => {
    // Create an instance of AuthApi with the mocked httpClient
    authApi = new AuthApi(mockHttpClient, baseApiUrl);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('login', () => {
    it('should successfully login and return token and userData', async () => {
      // Define the mock response for a successful login
      const mockResponse = {
        data: { userId: 1, username: 'testUser' },
        headers: { authorization: 'mockToken' },
      };

      // Mock the post method of httpClient
      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await authApi.login({
        profileEmail: 'test@example.com',
        profilePassword: 'password123',
      });

      expect(result).toEqual({
        token: 'mockToken',
        userData: { userId: 1, username: 'testUser' },
      });

      // Check if the post method was called with correct URL and headers
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `${baseApiUrl}/api/user_profile/login/`,
        { profileEmail: 'test@example.com', profilePassword: 'password123' },
        { headers: { 'Content-Type': 'application/json' } }
      );
    });

    it('should throw an error if no auth token is returned from login', async () => {
      // Define the mock response for a failed login (no token)
      const mockResponse = {
        data: { userId: 1, username: 'testUser' },
        headers: {},
      };

      // Mock the post method of httpClient
      mockHttpClient.post.mockResolvedValue(mockResponse);

      await expect(
        authApi.login({
          profileEmail: 'test@example.com',
          profilePassword: 'password123',
        })
      ).rejects.toThrow('No auth token returned from login');
    });

    it('should throw an error if login fails with an API error message', async () => {
      // Define the mock error response
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      // Mock the post method of httpClient to reject with an error
      mockHttpClient.post.mockRejectedValue(mockErrorResponse);

      await expect(
        authApi.login({
          profileEmail: 'test@example.com',
          profilePassword: 'wrongPassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Define the mock response for successful token validation
      const mockResponse = { data: { valid: true } };
      
      // Mock the get method of httpClient
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await authApi.validateToken('mockToken');
      expect(result).toBe(true);
    });

    it('should return false if token is invalid', async () => {
      // Define the mock response for invalid token validation
      const mockResponse = { data: { valid: false } };
      
      // Mock the get method of httpClient
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await authApi.validateToken('mockToken');
      expect(result).toBe(false);
    });

    it('should throw an error if token validation fails', async () => {
      // Define the mock error response
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Token validation failed',
          },
        },
      };

      // Mock the get method of httpClient to reject with an error
      mockHttpClient.get.mockRejectedValue(mockErrorResponse);

      await expect(authApi.validateToken('invalidToken')).rejects.toThrow('Token validation failed');
    });

    it('should throw an error if no token is provided', async () => {
      await expect(authApi.validateToken()).rejects.toThrow('No token provided');
    });
  });
});
