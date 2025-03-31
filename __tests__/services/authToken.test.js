// asyncStorageService.test.js
const AuthTokenService = require('../../services/authToken');

// Mock implementation of AsyncStorage
const mockAsyncStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('AuthTokenService', () => {
  let authTokenService;

  beforeEach(() => {
    // Inject the mock AsyncStorage into the service
    authTokenService = new AuthTokenService(mockAsyncStorage);
  });

  it('should call setItem with correct parameters', async () => {
    await authTokenService.setItem('userToken', 'abc123');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'abc123');
  });

  it('should return correct value when getItem is called', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('abc123');
    const result = await authTokenService.getItem('userToken');
    expect(result).toBe('abc123');
  });

  it('should call removeItem with correct parameters', async () => {
    await authTokenService.removeItem('userToken');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
  });
});
