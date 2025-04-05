// authApi.test.js

import { AuthApi } from '../../api/auth'; // Import the AuthApi class

describe('AuthApi', () => {
  let httpClient;
  let authApi;

  beforeEach(() => {
    // Mocking the httpClient to isolate testing of AuthApi
    httpClient = {
      post: jest.fn(),
      get: jest.fn(),
    };

    // Instantiate AuthApi with the mocked httpClient
    authApi = new AuthApi(httpClient, 'https://example.com');
  });

  describe('login', () => {
    it('should return token and userData on successful login', async () => {
      // Arrange
      const fakeToken = 'abc123';
      const userData = { id: 1, email: 'test@example.com' };

      // Mocking the post method of httpClient to resolve with mock data
      httpClient.post.mockResolvedValue({
        headers: { authorization: fakeToken },
        data: userData,
      });

      // Act
      const result = await authApi.login({
        profileEmail: 'test@example.com',
        profilePassword: 'secret',
      });

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://example.com/api/user_profile/login',
        {
          profileEmail: 'test@example.com',
          profilePassword: 'secret',
        }
      );
      expect(result.token).toBe(fakeToken);
      expect(result.userData).toEqual(userData);
    });
  });
});
