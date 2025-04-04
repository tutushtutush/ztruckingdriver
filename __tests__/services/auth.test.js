import jwt_decode from 'jwt-decode';
import { AuthService } from '../../services/auth';

jest.mock('jwt-decode', () => jest.fn()); // Mock jwt-decode

describe('AuthService', () => {
  let authService;
  let mockAuthApi;
  let mockAsyncStorage;

  beforeEach(() => {
    mockAuthApi = {
      login: jest.fn(),
      validateToken: jest.fn(),
    };
    mockAsyncStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clearAllStorage: jest.fn(),
    };

    authService = new AuthService(mockAuthApi, mockAsyncStorage);
  });

  describe('getToken', () => {
    it('should return token if it exists in AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mockToken');

      const token = await authService.getToken();
      expect(token).toBe('mockToken');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should throw an error if AsyncStorage fails', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(authService.getToken()).rejects.toThrow('Storage error');
    });
  });

  describe('isTokenValid', () => {
    it('should return true if token is valid', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mockToken');
      mockAuthApi.validateToken.mockResolvedValue(true);

      const isValid = await authService.isTokenValid();
      expect(isValid).toBe(true);
      expect(mockAuthApi.validateToken).toHaveBeenCalledWith('mockToken');
    });

    it('should return false if token is invalid', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mockToken');
      mockAuthApi.validateToken.mockResolvedValue(false);

      const isValid = await authService.isTokenValid();
      expect(isValid).toBe(false);
    });

    it('should return false if no token is found', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const isValid = await authService.isTokenValid();
      expect(isValid).toBe(false);
    });

    it('should return false if validation throws an error', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mockToken');
      mockAuthApi.validateToken.mockRejectedValue(new Error('Validation error'));

      const isValid = await authService.isTokenValid();
      expect(isValid).toBe(false);
    });
  });

  describe('getUserIdFromToken', () => {
    it('should return userId from a valid token', () => {
      const mockToken = 'mock.jwt.token';
      const decodedToken = { userId: '12345' };

      jwt_decode.mockReturnValue(decodedToken);

      const userId = authService.getUserIdFromToken(mockToken);
      expect(userId).toBe('12345');
      expect(jwt_decode).toHaveBeenCalledWith(mockToken);
    });

    it('should throw an error if token is invalid', () => {
      jwt_decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.getUserIdFromToken('invalidToken')).toThrow('Invalid token');
    });
  });

  describe('signIn', () => {
    it('should store token in AsyncStorage on successful login', async () => {
      mockAuthApi.login.mockResolvedValue('mockToken');
      mockAsyncStorage.setItem.mockResolvedValue();

      const success = await authService.signIn({ email: 'test@example.com', password: 'password' });
      expect(success).toBe(true);
      expect(mockAuthApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'mockToken');
    });

    it('should return false if login fails', async () => {
      mockAuthApi.login.mockResolvedValue(null);

      const success = await authService.signIn({ email: 'test@example.com', password: 'password' });
      expect(success).toBe(false);
    });

    it('should throw an error if login request fails', async () => {
      mockAuthApi.login.mockRejectedValue(new Error('Login failed'));

      await expect(authService.signIn({ email: 'test@example.com', password: 'password' })).rejects.toThrow('Login failed');
    });
  });

  describe('signOut', () => {
    it('should remove token from AsyncStorage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await authService.signOut();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle errors gracefully when removing token', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Removal failed'));

      await expect(authService.signOut()).resolves.not.toThrow();
    });
  });

  describe('clearAllStorage', () => {
    it('should clear all AsyncStorage items', async () => {
      mockAsyncStorage.clearAllStorage.mockResolvedValue();

      await authService.clearAllStorage();
      expect(mockAsyncStorage.clearAllStorage).toHaveBeenCalled();
    });

    it('should handle errors when clearing AsyncStorage', async () => {
      mockAsyncStorage.clearAllStorage.mockRejectedValue(new Error('Clear failed'));

      await expect(authService.clearAllStorage()).resolves.not.toThrow();
    });
  });
});
