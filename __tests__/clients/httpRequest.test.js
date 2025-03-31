// httpClient.test.js
import { HttpRequestClient } from '../../clients/httpRequest';

// Mock HTTP library
const mockHttpLibrary = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

describe('HttpRequestClient', () => {
  let httpRequestClient;

  beforeEach(() => {
    httpRequestClient = new HttpRequestClient(mockHttpLibrary);
    jest.clearAllMocks();
  });

  test('should call get method with correct arguments', async () => {
    mockHttpLibrary.get.mockResolvedValue({ data: 'test' });
    const response = await httpRequestClient.get('/test-url');
    expect(mockHttpLibrary.get).toHaveBeenCalledWith('/test-url', {});
    expect(response).toEqual({ data: 'test' });
  });

  test('should call post method with correct arguments', async () => {
    mockHttpLibrary.post.mockResolvedValue({ data: 'created' });
    const response = await httpRequestClient.post('/test-url', { key: 'value' });
    expect(mockHttpLibrary.post).toHaveBeenCalledWith('/test-url', { key: 'value' }, {});
    expect(response).toEqual({ data: 'created' });
  });

  test('should handle errors gracefully', async () => {
    mockHttpLibrary.get.mockRejectedValue(new Error('Network Error'));
    await expect(httpRequestClient.get('/test-url')).rejects.toThrow('Network Error');
  });
});
