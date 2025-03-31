// httpClient.js
export class HttpRequestClient {
    constructor(httpLibrary) {
      this.httpLibrary = httpLibrary;
    }
  
    async get(url, config = {}) {
      try {
        return await this.httpLibrary.get(url, config);
      } catch (error) {
        this.handleError(error);
      }
    }
  
    async post(url, data, config = {}) {
      try {
        return await this.httpLibrary.post(url, data, config);
      } catch (error) {
        this.handleError(error);
      }
    }
  
    async put(url, data, config = {}) {
      try {
        return await this.httpLibrary.put(url, data, config);
      } catch (error) {
        this.handleError(error);
      }
    }
  
    async delete(url, config = {}) {
      try {
        return await this.httpLibrary.delete(url, config);
      } catch (error) {
        this.handleError(error);
      }
    }
  
    handleError(error) {
      console.error('HTTP Error:', error);
      throw error;
    }
  }
  