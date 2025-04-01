// authService.test.js
import { AuthService } from '../../services/auth';

// Mock dependencies
const mockAuthApi = {
  validateToken: jest.fn(),
  login: jest.fn(),
};

const mockAuthTokenSvc = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService(mockAuthApi, mockAuthTokenSvc);
    jest.clearAllMocks();
  });

  test('should return false if no token is available', async () => {
    mockAuthTokenSvc.getItem.mockReturnValue(null);
    const isValid = await authService.isTokenValid();
    expect(isValid).toBe(false);
  });

  test('should validate token correctly', async () => {
    mockAuthTokenSvc.getItem.mockReturnValue('valid-token');
    mockAuthApi.validateToken.mockResolvedValue(true);
    const isValid = await authService.isTokenValid();
    expect(mockAuthApi.validateToken).toHaveBeenCalledWith('valid-token');
    expect(isValid).toBe(true);
  });

  test('should handle errors in token validation', async () => {
    mockAuthTokenSvc.getItem.mockReturnValue('valid-token');
    mockAuthApi.validateToken.mockRejectedValue(new Error('Validation error'));
    await expect(authService.isTokenValid()).rejects.toThrow('Validation error');
  });

  test('should store token on successful login', async () => {
    mockAuthApi.login.mockResolvedValue('new-token');
    await authService.signIn({ email: 'test@example.com', password: 'password' });
    expect(mockAuthApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(mockAuthTokenSvc.setItem).toHaveBeenCalledWith('new-token');
  });

  test('should throw error if login fails', async () => {
    mockAuthApi.login.mockRejectedValue(new Error('Login failed'));
    await expect(authService.signIn({ email: 'test@example.com', password: 'password' })).rejects.toThrow('Login failed');
  });

  test('should remove token on sign out', () => {
    authService.singOut();
    expect(mockAuthTokenSvc.removeItem).toHaveBeenCalled();
  });
});
