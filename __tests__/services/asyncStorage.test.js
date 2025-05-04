import { AsyncStorageService } from '../../services/asyncStorage';
import { trackApiError } from '../../utils/errorTracking';

// Mock AsyncStorage
const mockAsyncStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

// Mock error tracking
jest.mock('../../utils/errorTracking', () => ({
    trackApiError: jest.fn(),
}));

describe('AsyncStorageService', () => {
    let service;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AsyncStorageService(mockAsyncStorage, { trackApiError });
    });

    describe('constructor', () => {
        it('should throw error if invalid asyncStorage is provided', () => {
            expect(() => new AsyncStorageService(null)).toThrow('Invalid asyncStorage instance provided.');
            expect(() => new AsyncStorageService({})).toThrow('Invalid asyncStorage instance provided.');
        });

        it('should initialize with valid asyncStorage', () => {
            expect(() => new AsyncStorageService(mockAsyncStorage)).not.toThrow();
        });
    });

    describe('setItem', () => {
        it('should store authToken without stringifying', async () => {
            const token = 'test-token';
            await service.setItem('authToken', token);
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('authToken', token);
        });

        it('should stringify non-authToken values', async () => {
            const data = { test: 'data' };
            await service.setItem('testKey', data);
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(data));
        });

        it('should track errors with context', async () => {
            const error = new Error('Storage error');
            mockAsyncStorage.setItem.mockRejectedValueOnce(error);

            await expect(service.setItem('testKey', 'value')).rejects.toThrow('Storage error');
            expect(trackApiError).toHaveBeenCalledWith(error, 'AsyncStorage/setItem', {
                method: 'SET',
                key: 'testKey',
                value: 'value',
            });
        });

        it('should mask authToken value in error tracking', async () => {
            const error = new Error('Storage error');
            mockAsyncStorage.setItem.mockRejectedValueOnce(error);

            await expect(service.setItem('authToken', 'secret-token')).rejects.toThrow('Storage error');
            expect(trackApiError).toHaveBeenCalledWith(error, 'AsyncStorage/setItem', {
                method: 'SET',
                key: 'authToken',
                value: '***',
            });
        });
    });

    describe('getItem', () => {
        it('should return authToken without parsing', async () => {
            const token = 'test-token';
            mockAsyncStorage.getItem.mockResolvedValueOnce(token);
            const result = await service.getItem('authToken');
            expect(result).toBe(token);
        });

        it('should parse non-authToken values', async () => {
            const data = { test: 'data' };
            mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data));
            const result = await service.getItem('testKey');
            expect(result).toEqual(data);
        });

        it('should return null for non-existent items', async () => {
            mockAsyncStorage.getItem.mockResolvedValueOnce(null);
            const result = await service.getItem('nonExistentKey');
            expect(result).toBeNull();
        });

        it('should track errors with context', async () => {
            const error = new Error('Storage error');
            mockAsyncStorage.getItem.mockRejectedValueOnce(error);

            await expect(service.getItem('testKey')).rejects.toThrow('Storage error');
            expect(trackApiError).toHaveBeenCalledWith(error, 'AsyncStorage/getItem', {
                method: 'GET',
                key: 'testKey',
            });
        });
    });

    describe('removeItem', () => {
        it('should remove item from storage', async () => {
            await service.removeItem('testKey');
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('testKey');
        });

        it('should track errors with context', async () => {
            const error = new Error('Storage error');
            mockAsyncStorage.removeItem.mockRejectedValueOnce(error);

            await expect(service.removeItem('testKey')).rejects.toThrow('Storage error');
            expect(trackApiError).toHaveBeenCalledWith(error, 'AsyncStorage/removeItem', {
                method: 'REMOVE',
                key: 'testKey',
            });
        });
    });

    describe('clearAllStorage', () => {
        it('should clear all storage', async () => {
            await service.clearAllStorage();
            expect(mockAsyncStorage.clear).toHaveBeenCalled();
        });

        it('should track errors with context', async () => {
            const error = new Error('Storage error');
            mockAsyncStorage.clear.mockRejectedValueOnce(error);

            await expect(service.clearAllStorage()).rejects.toThrow('Storage error');
            expect(trackApiError).toHaveBeenCalledWith(error, 'AsyncStorage/clearAll', {
                method: 'CLEAR',
            });
        });
    });

    describe('error tracking optionality', () => {
        it('should work without error tracker', async () => {
            const serviceWithoutTracker = new AsyncStorageService(mockAsyncStorage);
            const error = new Error('Storage error');
            mockAsyncStorage.setItem.mockRejectedValueOnce(error);

            await expect(serviceWithoutTracker.setItem('testKey', 'value')).rejects.toThrow('Storage error');
            expect(trackApiError).not.toHaveBeenCalled();
        });
    });
});
