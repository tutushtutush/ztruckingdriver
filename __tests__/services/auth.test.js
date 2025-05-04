// AuthService.test.js
import { AuthService } from '../../services/auth';
import { trackApiError } from '../../utils/errorTracking';

// Mock dependencies
const mockAuthApi = {
  login: jest.fn(),
  validateToken: jest.fn(),
};

const mockAsyncStorageSvc = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clearAllStorage: jest.fn(),
};

// Mock error tracking
jest.mock('../../utils/errorTracking', () => ({
  trackApiError: jest.fn(),
}));

describe('AuthService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockAuthApi, mockAsyncStorageSvc, { trackApiError });
  });

  describe('constructor', () => {
    it('should initialize with dependencies', () => {
      expect(() => new AuthService(mockAuthApi, mockAsyncStorageSvc)).not.toThrow();
    });
  });

  describe('getToken', () => {
    it('should get token from storage', async () => {
      const token = 'test-token';
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(token);
      const result = await service.getToken();
      expect(result).toBe(token);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should track errors with context', async () => {
      const error = new Error('Storage error');
      mockAsyncStorageSvc.getItem.mockRejectedValueOnce(error);

      await expect(service.getToken()).rejects.toThrow('Storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/getToken', {
        method: 'GET',
        key: 'authToken',
      });
    });
  });

  describe('rememberedUsername', () => {
    it('should set remembered username', async () => {
      const username = 'test@example.com';
      await service.setRememberedUsername(username);
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('rememberedUsername', username);
    });

    it('should get remembered username', async () => {
      const username = 'test@example.com';
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(username);
      const result = await service.getRememberedUsername();
      expect(result).toBe(username);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('rememberedUsername');
    });

    it('should remove remembered username', async () => {
      await service.removeRememberedUsername();
      expect(mockAsyncStorageSvc.removeItem).toHaveBeenCalledWith('rememberedUsername');
    });

    it('should track errors for remembered username operations', async () => {
      const error = new Error('Storage error');
      const username = 'test@example.com';

      // Test set error
      mockAsyncStorageSvc.setItem.mockRejectedValueOnce(error);
      await expect(service.setRememberedUsername(username)).rejects.toThrow('Storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/setRememberedUsername', {
        method: 'SET',
        key: 'rememberedUsername',
        value: username,
      });

      // Test get error
      mockAsyncStorageSvc.getItem.mockRejectedValueOnce(error);
      await expect(service.getRememberedUsername()).rejects.toThrow('Storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/getRememberedUsername', {
        method: 'GET',
        key: 'rememberedUsername',
      });

      // Test remove error
      mockAsyncStorageSvc.removeItem.mockRejectedValueOnce(error);
      await expect(service.removeRememberedUsername()).rejects.toThrow('Storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/removeRememberedUsername', {
        method: 'REMOVE',
        key: 'rememberedUsername',
      });
    });
  });

  describe('isTokenValid', () => {
    it('should return false if no token exists', async () => {
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(null);
      const result = await service.isTokenValid();
      expect(result).toBe(false);
      expect(mockAuthApi.validateToken).not.toHaveBeenCalled();
    });

    it('should validate existing token', async () => {
      const token = 'test-token';
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(token);
      mockAuthApi.validateToken.mockResolvedValueOnce(true);
      const result = await service.isTokenValid();
      expect(result).toBe(true);
      expect(mockAuthApi.validateToken).toHaveBeenCalledWith(token);
    });

    it('should track errors with context', async () => {
      const error = new Error('Validation error');
      const token = 'test-token';
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(token);
      mockAuthApi.validateToken.mockRejectedValueOnce(error);

      const result = await service.isTokenValid();
      expect(result).toBe(false);
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/isTokenValid', {
        method: 'VALIDATE',
        hasToken: true,
      });
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const credentials = {
        profileEmail: 'test@example.com',
        profilePassword: 'password123',
      };
      const token = 'test-token';
      const userData = { id: 1, name: 'Test User' };
      mockAuthApi.login.mockResolvedValueOnce({ token, userData });

      const result = await service.signIn(credentials);
      expect(result).toBe(true);
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('authToken', token);
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData));
    });

    it('should return false for invalid login response', async () => {
      const credentials = {
        profileEmail: 'test@example.com',
        profilePassword: 'password123',
      };
      mockAuthApi.login.mockResolvedValueOnce({ token: null, userData: null });

      const result = await service.signIn(credentials);
      expect(result).toBe(false);
      expect(mockAsyncStorageSvc.setItem).not.toHaveBeenCalled();
    });

    it('should track errors with context', async () => {
      const error = new Error('Login error');
      const credentials = {
        profileEmail: 'test@example.com',
        profilePassword: 'password123',
      };
      mockAuthApi.login.mockRejectedValueOnce(error);

      await expect(service.signIn(credentials)).rejects.toThrow('Login error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/signIn', {
        method: 'LOGIN',
        hasEmail: true,
        hasPassword: true,
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      await service.signOut();
      expect(mockAsyncStorageSvc.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockAsyncStorageSvc.removeItem).toHaveBeenCalledWith('user');
    });

    it('should track errors with context', async () => {
      const error = new Error('Sign out error');
      mockAsyncStorageSvc.removeItem.mockRejectedValueOnce(error);

      await expect(service.signOut()).rejects.toThrow('Sign out error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/signOut', {
        method: 'LOGOUT',
      });
    });
  });

  describe('clearAllStorage', () => {
    it('should clear storage successfully', async () => {
      await service.clearAllStorage();
      expect(mockAsyncStorageSvc.clearAllStorage).toHaveBeenCalled();
    });

    it('should track errors with context', async () => {
      const error = new Error('Clear storage error');
      mockAsyncStorageSvc.clearAllStorage.mockRejectedValueOnce(error);

      await expect(service.clearAllStorage()).rejects.toThrow('Clear storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'AuthService/clearAllStorage', {
        method: 'CLEAR',
      });
    });
  });

  describe('error tracking optionality', () => {
    it('should work without error tracker', async () => {
      const serviceWithoutTracker = new AuthService(mockAuthApi, mockAsyncStorageSvc);
      const error = new Error('Storage error');
      mockAsyncStorageSvc.getItem.mockRejectedValueOnce(error);

      await expect(serviceWithoutTracker.getToken()).rejects.toThrow('Storage error');
      expect(trackApiError).not.toHaveBeenCalled();
    });
  });
});
