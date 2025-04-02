import { UserApi } from '../../api/user';

// Mock HTTP client
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
};

describe('UserApi', () => {
  let userApi;

  beforeEach(() => {
    userApi = new UserApi(mockHttpClient, 'testBaseApiUrl');
    jest.clearAllMocks();
  });

  test('should return user data on success', async () => {
    mockHttpClient.get.mockResolvedValue({ data: { userId: 'test-user-id', email: 'test-email' } });
    const user = await userApi.getUser('test-user-id');
    expect(mockHttpClient.get).toHaveBeenCalledWith('testBaseApiUrl/user/test-user-id');
    expect(user.userId).toBe('test-user-id');
    expect(user.email).toBe('test-email');
  });

  test('should throw error if no user id is provided for validation', async () => {
    await expect(userApi.getUser(null)).rejects.toThrow('User Id is required!');
  });
});
