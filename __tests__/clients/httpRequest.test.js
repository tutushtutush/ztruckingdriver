// httpClient.test.js
import { HttpRequestClient } from '../../clients/httpRequest';

describe('HttpRequestClient', () => {
  let mockHttpLibrary;
  let mockErrorTracker;
  let client;

  beforeEach(() => {
    mockHttpLibrary = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    mockErrorTracker = {
      trackApiError: jest.fn(),
    };

    client = new HttpRequestClient(mockHttpLibrary, mockErrorTracker);
  });

  describe('constructor', () => {
    it('should initialize with http library and error tracker', () => {
      const client = new HttpRequestClient(mockHttpLibrary, mockErrorTracker);
      expect(client.httpLibrary).toBe(mockHttpLibrary);
      expect(client.errorTracker).toBe(mockErrorTracker);
    });

    it('should work without error tracker', () => {
      const client = new HttpRequestClient(mockHttpLibrary);
      expect(client.httpLibrary).toBe(mockHttpLibrary);
      expect(client.errorTracker).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should make GET request successfully', async () => {
      const url = '/test';
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = { data: 'success' };
      mockHttpLibrary.get.mockResolvedValue(response);

      const result = await client.get(url, config);

      expect(mockHttpLibrary.get).toHaveBeenCalledWith(url, config);
      expect(result).toBe(response);
    });

    it('should track error when GET request fails', async () => {
      const url = '/test';
      const config = { headers: { 'Content-Type': 'application/json' } };
      const error = new Error('Request failed');
      error.response = { status: 404, data: { message: 'Not found' } };
      mockHttpLibrary.get.mockRejectedValue(error);

      await expect(client.get(url, config)).rejects.toThrow('Request failed');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        url,
        expect.objectContaining({
          method: 'GET',
          headers: config.headers,
          response: error.response.data,
          status: error.response.status,
        })
      );
    });
  });

  describe('post', () => {
    it('should make POST request successfully', async () => {
      const url = '/test';
      const data = { name: 'test' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = { data: 'success' };
      mockHttpLibrary.post.mockResolvedValue(response);

      const result = await client.post(url, data, config);

      expect(mockHttpLibrary.post).toHaveBeenCalledWith(url, data, config);
      expect(result).toBe(response);
    });

    it('should track error when POST request fails', async () => {
      const url = '/test';
      const data = { name: 'test' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      const error = new Error('Request failed');
      error.response = { status: 400, data: { message: 'Bad request' } };
      mockHttpLibrary.post.mockRejectedValue(error);

      await expect(client.post(url, data, config)).rejects.toThrow('Request failed');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        url,
        expect.objectContaining({
          method: 'POST',
          data,
          headers: config.headers,
          response: error.response.data,
          status: error.response.status,
        })
      );
    });
  });

  describe('put', () => {
    it('should make PUT request successfully', async () => {
      const url = '/test';
      const data = { name: 'test' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = { data: 'success' };
      mockHttpLibrary.put.mockResolvedValue(response);

      const result = await client.put(url, data, config);

      expect(mockHttpLibrary.put).toHaveBeenCalledWith(url, data, config);
      expect(result).toBe(response);
    });

    it('should track error when PUT request fails', async () => {
      const url = '/test';
      const data = { name: 'test' };
      const config = { headers: { 'Content-Type': 'application/json' } };
      const error = new Error('Request failed');
      error.response = { status: 500, data: { message: 'Server error' } };
      mockHttpLibrary.put.mockRejectedValue(error);

      await expect(client.put(url, data, config)).rejects.toThrow('Request failed');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        url,
        expect.objectContaining({
          method: 'PUT',
          data,
          headers: config.headers,
          response: error.response.data,
          status: error.response.status,
        })
      );
    });
  });

  describe('delete', () => {
    it('should make DELETE request successfully', async () => {
      const url = '/test';
      const config = { headers: { 'Content-Type': 'application/json' } };
      const response = { data: 'success' };
      mockHttpLibrary.delete.mockResolvedValue(response);

      const result = await client.delete(url, config);

      expect(mockHttpLibrary.delete).toHaveBeenCalledWith(url, config);
      expect(result).toBe(response);
    });

    it('should track error when DELETE request fails', async () => {
      const url = '/test';
      const config = { headers: { 'Content-Type': 'application/json' } };
      const error = new Error('Request failed');
      error.response = { status: 403, data: { message: 'Forbidden' } };
      mockHttpLibrary.delete.mockRejectedValue(error);

      await expect(client.delete(url, config)).rejects.toThrow('Request failed');

      expect(mockErrorTracker.trackApiError).toHaveBeenCalledWith(
        error,
        url,
        expect.objectContaining({
          method: 'DELETE',
          headers: config.headers,
          response: error.response.data,
          status: error.response.status,
        })
      );
    });
  });

  describe('error handling without error tracker', () => {
    it('should not track errors when no error tracker is provided', async () => {
      const client = new HttpRequestClient(mockHttpLibrary);
      const url = '/test';
      const error = new Error('Request failed');
      mockHttpLibrary.get.mockRejectedValue(error);

      await expect(client.get(url)).rejects.toThrow('Request failed');
      expect(mockErrorTracker.trackApiError).not.toHaveBeenCalled();
    });
  });
});
