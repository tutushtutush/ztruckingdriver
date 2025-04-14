import { UserService } from '../../services/user'; // Import the UserService class

describe('UserService', () => {
  let userService;
  const mockAsyncStorageSvc = {
    getItem: jest.fn(),
  };

  const mockUserData = { userId: '123', username: 'testUser' };

  beforeEach(() => {
    // Create a new instance of UserService with the mocked AsyncStorageSvc
    userService = new UserService(null, mockAsyncStorageSvc);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  describe('getUser', () => {
    it('should retrieve the user from AsyncStorage if it exists', async () => {
      // Simulate AsyncStorage containing the user data
      mockAsyncStorageSvc.getItem.mockResolvedValue(JSON.stringify(mockUserData));

      const result = await userService.getUser();

      expect(result).toEqual(mockUserData);
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null if no user is found in AsyncStorage', async () => {
      // Simulate no user data in AsyncStorage
      mockAsyncStorageSvc.getItem.mockResolvedValue(null);

      const result = await userService.getUser();

      expect(result).toBeNull();
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('user');
    });

    it('should throw an error if AsyncStorage fails', async () => {
      // Simulate failure in AsyncStorage getItem method
      mockAsyncStorageSvc.getItem.mockRejectedValue(new Error('AsyncStorage error'));

      await expect(userService.getUser()).rejects.toThrow('AsyncStorage error');
      expect(mockAsyncStorageSvc.getItem).toHaveBeenCalledWith('user');
    });
  });
});
