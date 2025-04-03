// asyncStorageService.test.js
const AsyncStorageService = require('../../services/asyncStorage');

describe('AsyncStorageService', () => {
  let mockAsyncStorage;
  let asyncStorageService;

  beforeEach(() => {
    // Mock AsyncStorage methods
    mockAsyncStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    asyncStorageService = new AsyncStorageService(mockAsyncStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should store an item in AsyncStorage', async () => {
    await asyncStorageService.setItem('key1', { test: 'data' });

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'key1',
      JSON.stringify({ test: 'data' })
    );
  });

  test('should retrieve an item from AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ test: 'data' }));

    const result = await asyncStorageService.getItem('key1');

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key1');
    expect(result).toEqual({ test: 'data' });
  });

  test('should return null if getItem returns null', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const result = await asyncStorageService.getItem('key1');

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('key1');
    expect(result).toBeNull();
  });

  test('should remove an item from AsyncStorage', async () => {
    await asyncStorageService.removeItem('key1');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('key1');
  });

  test('should throw an error if setItem fails', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    await expect(asyncStorageService.setItem('key1', { test: 'data' })).rejects.toThrow('Storage error');
  });

  test('should throw an error if getItem fails', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Retrieval error'));

    await expect(asyncStorageService.getItem('key1')).rejects.toThrow('Retrieval error');
  });

  test('should throw an error if removeItem fails', async () => {
    mockAsyncStorage.removeItem.mockRejectedValue(new Error('Remove error'));

    await expect(asyncStorageService.removeItem('key1')).rejects.toThrow('Remove error');
  });
});
