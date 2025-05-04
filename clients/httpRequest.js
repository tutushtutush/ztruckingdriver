// httpClient.js
export class HttpRequestClient {
  constructor(httpLibrary, errorTracker) {
    this.httpLibrary = httpLibrary;
    this.errorTracker = errorTracker;
  }

  async get(url, config = {}) {
    try {
      return await this.httpLibrary.get(url, config);
    } catch (error) {
      await this.handleError(error, 'GET', url, config);
      throw error;
    }
  }

  async post(url, data, config = {}) {
    try {
      return await this.httpLibrary.post(url, data, config);
    } catch (error) {
      await this.handleError(error, 'POST', url, { data, ...config });
      throw error;
    }
  }

  async put(url, data, config = {}) {
    try {
      return await this.httpLibrary.put(url, data, config);
    } catch (error) {
      await this.handleError(error, 'PUT', url, { data, ...config });
      throw error;
    }
  }

  async delete(url, config = {}) {
    try {
      return await this.httpLibrary.delete(url, config);
    } catch (error) {
      await this.handleError(error, 'DELETE', url, config);
      throw error;
    }
  }

  async handleError(error, method, url, requestData) {
    if (this.errorTracker) {
      await this.errorTracker.trackApiError(error, url, {
        method,
        ...requestData,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  }
}
  