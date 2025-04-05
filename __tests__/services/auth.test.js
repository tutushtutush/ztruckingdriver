// AuthService.test.js
import { AuthService } from '../../services/auth';

describe('AuthService', () => {
  let authService;
  let mockAuthApi;
  let mockAsyncStorageSvc;

  beforeEach(() => {
    // Create mock instances for dependencies
    mockAuthApi = {
      login: jest.fn(),
      validateToken: jest.fn(),
    };

    mockAsyncStorageSvc = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clearAllStorage: jest.fn(),
    };

    // Create an instance of AuthService with mocked dependencies
    authService = new AuthService(mockAuthApi, mockAsyncStorageSvc);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should get token from AsyncStorage', async () => {
    // Arrange
    const token = 'mockToken';
    mockAsyncStorageSvc.getItem.mockResolvedValue(token);

    // Act
    const result = await authService.getToken();

    // Assert
    expect(result).toBe(token);
    expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('authToken');
  });

  test('should validate token successfully', async () => {
    // Arrange
    const token = 'mockToken';
    mockAsyncStorageSvc.getItem.mockResolvedValue(token);
    mockAuthApi.validateToken.mockResolvedValue(true);

    // Act
    const result = await authService.isTokenValid();

    // Assert
    expect(result).toBe(true);
    expect(mockAuthApi.validateToken).toHaveBeenCalledWith(token);
  });

  test('should return false if token is not valid', async () => {
    // Arrange
    const token = 'mockToken';
    mockAsyncStorageSvc.getItem.mockResolvedValue(token);
    mockAuthApi.validateToken.mockResolvedValue(false);

    // Act
    const result = await authService.isTokenValid();

    // Assert
    expect(result).toBe(false);
    expect(mockAuthApi.validateToken).toHaveBeenCalledWith(token);
  });

  test('should sign in and store token and user data', async () => {
    // Arrange
    const profileEmail = 'test@example.com';
    const profilePassword = 'password';
    const token = 'mockToken';
    const userData = { id: 1, email: profileEmail };

    mockAuthApi.login.mockResolvedValue({ token, userData });

    // Act
    const result = await authService.signIn({ profileEmail, profilePassword });

    // Assert
    expect(result).toBe(true);
    expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('authToken', JSON.stringify(token));
    expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData));
  });

  test('should sign out and remove token and user data from AsyncStorage', async () => {
    // Act
    await authService.signOut();

    // Assert
    expect(mockAsyncStorageSvc.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockAsyncStorageSvc.removeItem).toHaveBeenCalledWith('user');
  });

  test('should clear all AsyncStorage data', async () => {
    // Act
    await authService.clearAllStorage();

    // Assert
    expect(mockAsyncStorageSvc.clearAllStorage).toHaveBeenCalled();
  });

  test('should throw error when login fails', async () => {
    // Arrange
    const profileEmail = 'test@example.com';
    const profilePassword = 'wrongpassword';
    mockAuthApi.login.mockRejectedValue(new Error('Login failed'));

    // Act & Assert
    await expect(authService.signIn({ profileEmail, profilePassword })).rejects.toThrow('Login failed');
  });

  test('should return false if no token is found during validation', async () => {
    // Arrange
    mockAsyncStorageSvc.getItem.mockResolvedValue(null);

    // Act
    const result = await authService.isTokenValid();

    // Assert
    expect(result).toBe(false);
  });
});
