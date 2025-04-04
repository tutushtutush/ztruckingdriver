// authApi.test.js
import { AuthApi } from '../../api/auth';

// Mock HTTP client
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

describe('AuthApi', () => {
  let authApi;

  beforeEach(() => {
    authApi = new AuthApi(mockHttpClient, 'testBaseApiUrl');
    jest.clearAllMocks();
  });

  test('should return token on successful login', async () => {
    mockHttpClient.post.mockResolvedValue({ data: { token: 'test-token' } });
    const token = await authApi.login({ username: 'user', password: 'pass' });
    expect(mockHttpClient.post).toHaveBeenCalledWith('testBaseApiUrl/auth/login', { username: 'user', password: 'pass' });
    expect(token).toBe('test-token');
  });

  test('should throw error on failed login', async () => {
    mockHttpClient.post.mockRejectedValue(new Error('Login failed'));
    await expect(authApi.login({ username: 'user', password: 'pass' })).rejects.toThrow('Login failed');
  });

  test('should validate token successfully', async () => {
    mockHttpClient.get.mockResolvedValue({ data: { valid: true } });
    const isValid = await authApi.validateToken('test-token');
    expect(mockHttpClient.get).toHaveBeenCalledWith('testBaseApiUrl/auth/validate', {
      headers: { Authorization: 'Bearer test-token' },
    });
    expect(isValid).toBe(true);
  });

  test('should return false for invalid token', async () => {
    mockHttpClient.get.mockRejectedValue(new Error('Token validation failed'));
    const isValid = await authApi.validateToken('invalid-token');
    expect(isValid).toBe(false);
  });

  test('should throw error if no token is provided for validation', async () => {
    await expect(authApi.validateToken(null)).rejects.toThrow('No token provided');
  });
});
