import { UserService } from '../../services/user'; // Import the UserService class
import { trackApiError } from '../../utils/errorTracking';

// Mock dependencies
const mockUserApi = {
  getUser: jest.fn(),
};

const mockAsyncStorageSvc = {
  getItem: jest.fn(),
};

// Mock error tracking
jest.mock('../../utils/errorTracking', () => ({
  trackApiError: jest.fn(),
}));

describe('UserService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockUserApi, mockAsyncStorageSvc, { trackApiError });
  });

  describe('constructor', () => {
    it('should initialize with dependencies', () => {
      expect(() => new UserService(mockUserApi, mockAsyncStorageSvc)).not.toThrow();
    });
  });

  describe('getUser', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should return user from storage when available', async () => {
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
      const result = await service.getUser();
      expect(result).toEqual(mockUser);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('user');
      expect(mockUserApi.getUser).not.toHaveBeenCalled();
    });

    it('should return null when no user in storage', async () => {
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(null);
      const result = await service.getUser();
      expect(result).toBeNull();
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('user');
      expect(mockUserApi.getUser).not.toHaveBeenCalled();
    });

    it('should track storage errors with context', async () => {
      const error = new Error('Storage error');
      mockAsyncStorageSvc.getItem.mockRejectedValueOnce(error);

      await expect(service.getUser()).rejects.toThrow('Storage error');
      expect(trackApiError).toHaveBeenCalledWith(error, 'UserService/getUser', {
        method: 'GET',
        source: 'storage',
        hasStoredUser: false,
      });
    });

    it('should track JSON parse errors with context', async () => {
      const error = new Error('Invalid JSON');
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce('invalid-json');
      jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.getUser()).rejects.toThrow('Invalid JSON');
      expect(trackApiError).toHaveBeenCalledWith(error, 'UserService/getUser', {
        method: 'GET',
        source: 'storage',
        hasStoredUser: true,
      });
    });
  });

  describe('error tracking optionality', () => {
    it('should work without error tracker', async () => {
      const serviceWithoutTracker = new UserService(mockUserApi, mockAsyncStorageSvc);
      const error = new Error('Storage error');
      mockAsyncStorageSvc.getItem.mockRejectedValueOnce(error);

      await expect(serviceWithoutTracker.getUser()).rejects.toThrow('Storage error');
      expect(trackApiError).not.toHaveBeenCalled();
    });
  });
});
