import { AuthApi } from '../../api/auth'; // Import the class you're testing

// Mock the httpClient (instead of axios)
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

// Mock the error tracker
const mockErrorTracker = {
  trackApiError: jest.fn(),
};

describe('AuthApi', () => {
  let authApi;
  const baseApiUrl = 'http://api.example.com';

  beforeEach(() => {
    // Create an instance of AuthApi with the mocked httpClient and error tracker
    authApi = new AuthApi(mockHttpClient, baseApiUrl, mockErrorTracker);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('constructor', () => {
    it('should initialize with http client, base url and error tracker', () => {
      const authApi = new AuthApi(mockHttpClient, baseApiUrl, mockErrorTracker);
      expect(authApi.httpClient).toBe(mockHttpClient);
      expect(authApi.baseApiUrl).toBe(baseApiUrl);
      expect(authApi.errorTracker).toBe(mockErrorTracker);
    });

    it('should work without error tracker', () => {
      const authApi = new AuthApi(mockHttpClient, baseApiUrl);
      expect(authApi.httpClient).toBe(mockHttpClient);
      expect(authApi.baseApiUrl).toBe(baseApiUrl);
      expect(authApi.errorTracker).toBeUndefined();
    });
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

    it('should track error when no auth token is returned from login', async () => {
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

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        expect.any(Error),
        `${baseApiUrl}/api/user_profile/login/`,
        expect.objectContaining({
          method: 'POST',
          data: { profileEmail: '***' },
        })
      );
    });

    it('should track error when login fails with an API error message', async () => {
      // Define the mock error response
      const mockErrorResponse = {
        response: {
          status: 401,
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

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        mockErrorResponse,
        `${baseApiUrl}/api/user_profile/login/`,
        expect.objectContaining({
          method: 'POST',
          data: { profileEmail: '***' },
          response: mockErrorResponse.response.data,
          status: mockErrorResponse.response.status,
        })
      );
    });

    it('should not track errors when no error tracker is provided', async () => {
      const authApi = new AuthApi(mockHttpClient, baseApiUrl);
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };
      mockHttpClient.post.mockRejectedValue(mockErrorResponse);

      await expect(
        authApi.login({
          profileEmail: 'test@example.com',
          profilePassword: 'wrongPassword',
        })
      ).rejects.toThrow('Invalid credentials');
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
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

    it('should track error when token validation fails', async () => {
      // Define the mock error response
      const mockErrorResponse = {
        response: {
          status: 500,
          data: {
            message: 'Token validation failed',
          },
        },
      };

      // Mock the get method of httpClient to reject with an error
      mockHttpClient.get.mockRejectedValue(mockErrorResponse);

      await expect(authApi.validateToken('invalidToken')).rejects.toThrow('Token validation failed');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        mockErrorResponse,
        `${baseApiUrl}/auth/validate`,
        expect.objectContaining({
          method: 'GET',
          response: mockErrorResponse.response.data,
          status: mockErrorResponse.response.status,
        })
      );
    });

    it('should track error when no token is provided', async () => {
      await expect(authApi.validateToken()).rejects.toThrow('No token provided');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        expect.any(Error),
        `${baseApiUrl}/auth/validate`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should not track errors when no error tracker is provided', async () => {
      const authApi = new AuthApi(mockHttpClient, baseApiUrl);
      const mockErrorResponse = {
        response: {
          data: {
            message: 'Token validation failed',
          },
        },
      };
      mockHttpClient.get.mockRejectedValue(mockErrorResponse);

      await expect(authApi.validateToken('invalidToken')).rejects.toThrow('Token validation failed');
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });
  });
});
