export class UserApi {
  constructor(httpClient, baseApiUrl, errorTracker) {
    this.httpClient = httpClient;
    this.baseApiUrl = baseApiUrl;
    this.errorTracker = errorTracker;
  }
}
  