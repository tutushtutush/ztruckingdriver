import { UserService } from '../../services/user';

describe('UserService', () => {
    let mockUserApi;
    let userService;

    beforeEach(() => {
        mockUserApi = {
            getUser: jest.fn(),
        };
        userService = new UserService(mockUserApi);
    });

    it('should return user data when getUser is successful', async () => {
        const mockUser = { id: 1, name: 'John Doe' };
        mockUserApi.getUser.mockResolvedValue(mockUser);

        const result = await userService.getUser(1);

        expect(result).toEqual(mockUser);
        expect(mockUserApi.getUser).toHaveBeenCalledWith(1);
    });

    it('should throw an error when getUser fails', async () => {
        const mockError = new Error('User not found');
        mockUserApi.getUser.mockRejectedValue(mockError);

        await expect(userService.getUser(1)).rejects.toThrow('User not found');
        expect(mockUserApi.getUser).toHaveBeenCalledWith(1);
    });
});
