import { AsyncStorageService } from '../../services/asyncStorage';

describe('AsyncStorageService', () => {
  let asyncStorageService;
  let mockAsyncStorage;

  beforeEach(() => {
    // Mock the AsyncStorage methods
    mockAsyncStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    // Create an instance of AsyncStorageService with mocked AsyncStorage
    asyncStorageService = new AsyncStorageService(mockAsyncStorage);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test('should store data using setItem', async () => {
    // Arrange
    const key = 'authToken';
    const value = { token: 'mockToken' };

    // Act
    await asyncStorageService.setItem(key, value);

    // Assert
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
  });

  test('should fetch data using getItem', async () => {
    // Arrange
    const key = 'authToken';
    const value = { token: 'mockToken' };
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(value));

    // Act
    const result = await asyncStorageService.getItem(key);

    // Assert
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(result).toEqual(value);
  });

  test('should return null if no data found in getItem', async () => {
    // Arrange
    const key = 'authToken';
    mockAsyncStorage.getItem.mockResolvedValue(null);

    // Act
    const result = await asyncStorageService.getItem(key);

    // Assert
    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  test('should remove data using removeItem', async () => {
    // Arrange
    const key = 'authToken';

    // Act
    await asyncStorageService.removeItem(key);

    // Assert
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(key);
  });

  test('should clear all data using clearAllStorage', async () => {
    // Act
    await asyncStorageService.clearAllStorage();

    // Assert
    expect(mockAsyncStorage.clear).toHaveBeenCalled();
  });

  test('should throw error if setItem fails', async () => {
    // Arrange
    const key = 'authToken';
    const value = { token: 'mockToken' };
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Failed to save'));

    // Act & Assert
    await expect(asyncStorageService.setItem(key, value)).rejects.toThrow('Failed to save');
  });

  test('should throw error if getItem fails', async () => {
    // Arrange
    const key = 'authToken';
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Failed to fetch'));

    // Act & Assert
    await expect(asyncStorageService.getItem(key)).rejects.toThrow('Failed to fetch');
  });

  test('should throw error if removeItem fails', async () => {
    // Arrange
    const key = 'authToken';
    mockAsyncStorage.removeItem.mockRejectedValue(new Error('Failed to remove'));

    // Act & Assert
    await expect(asyncStorageService.removeItem(key)).rejects.toThrow('Failed to remove');
  });

  test('should throw error if clearAllStorage fails', async () => {
    // Arrange
    mockAsyncStorage.clear.mockRejectedValue(new Error('Failed to clear'));
  
    // Act & Assert
    await expect(asyncStorageService.clearAllStorage()).rejects.toThrow('Failed to clear');
  });
  

  test('should throw error if AsyncStorage instance is invalid', () => {
    // Act & Assert
    expect(() => new AsyncStorageService(null)).toThrow('Invalid asyncStorage instance provided.');
  });
});
