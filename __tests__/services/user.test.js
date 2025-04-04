import { UserService } from '../../services/user'; // Adjust import if needed

// Mock the dependencies
const mockUserApi = {
  getUser: jest.fn(),
};

const mockAsyncStorageSvc = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

describe('UserService', () => {
  let userService;

  beforeEach(() => {
    // Create a new instance of UserService with mocked dependencies
    userService = new UserService(mockUserApi, mockAsyncStorageSvc);
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error to prevent actual logs
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  describe('getUser', () => {
    it('should fetch user from AsyncStorage if available', async () => {
      const mockUserId = 1;
      const mockStoredUser = { id: 1, name: 'John Doe' };

      // Mock AsyncStorage to return stored user data
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(JSON.stringify(mockStoredUser));

      const result = await userService.getUser(mockUserId);

      expect(result).toEqual(mockStoredUser); // Ensure returned user data matches mockStoredUser
      expect(mockUserApi.getUser).not.toHaveBeenCalled(); // Ensure no API call was made
    });

    it('should fetch user from API and store it in AsyncStorage if not available', async () => {
      const mockUserId = 1;
      const mockUserData = { id: 1, name: 'John Doe' };

      // Mock AsyncStorage to return null (user data not found)
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(null);
      // Mock API to return user data
      mockUserApi.getUser.mockResolvedValue(mockUserData);

      const result = await userService.getUser(mockUserId);

      expect(result).toEqual(mockUserData); // Ensure returned user data matches mockUserData
      expect(mockUserApi.getUser).toHaveBeenCalledWith(mockUserId); // Ensure API call was made
      expect(mockAsyncStorageSvc.setItem).toHaveBeenCalledWith(`user-${mockUserId}`, JSON.stringify(mockUserData)); // Ensure user data is saved in AsyncStorage
    });

    it('should handle errors gracefully and log them', async () => {
      const mockUserId = 1;
      const mockError = new Error('Error fetching user data');

      // Mock AsyncStorage to return null (user data not found)
      mockAsyncStorageSvc.getItem.mockResolvedValueOnce(null);
      // Mock API to throw an error
      mockUserApi.getUser.mockRejectedValue(mockError);

      await expect(userService.getUser(mockUserId)).rejects.toThrow(mockError); // Expect error to be thrown

      // Check that the error was logged
      expect(console.error).toHaveBeenCalledWith('Error getting user data', mockError);
    });
  });
});
