const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const Board = require('../../../models/Board');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../models/Board');
jest.mock('../../../services/userService');

describe('GET /boards/owned', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        getUser.mockResolvedValue(null);

        const res = await request(app)
            .get('/boards/owned')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('msg', 'user not found');
    });

    it('should return 200 if user is found', async () => {
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null };
        const mockBoards = [{ title: 'Test Board', createdBy: 'userId2', createdBy: 'userId2', members: [] }];

        getUser.mockResolvedValue(mockUser);

        const boardFindQuery = {
            lean: jest.fn().mockResolvedValue(mockBoards),
        };

        Board.find.mockReturnValue(boardFindQuery);

        const res = await request(app)
            .get('/boards/owned')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ boards: mockBoards });
    });
});
