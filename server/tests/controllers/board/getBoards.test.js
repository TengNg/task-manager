const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const Board = require('../../../models/Board');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../models/Board');
jest.mock('../../../services/userService');

describe('GET /boards', () => {
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
            .get('/boards/')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('msg', 'user not found');
    });

    it('should return boards if user is found and have no recently viewed board', async () => {
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null };
        const mockBoards = [{ title: 'Test Board', createdBy: 'userId', createdBy: 'userId', members: [] }];

        getUser.mockResolvedValue(mockUser);

        const boardFindQuery = {
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockBoards),
        };
        Board.find.mockReturnValue(boardFindQuery);

        const res = await request(app)
            .get('/boards/')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ boards: mockBoards });
    });

    it('should return boards if user is found and recently viewed board not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: boardId };
        const mockBoards = [{ title: 'Test Board', createdBy: 'userId', createdBy: 'userId', members: [] }];

        getUser.mockResolvedValue(mockUser);

        const boardFindQuery = {
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockBoards),
        };

        Board.find.mockReturnValue(boardFindQuery);

        Board.findById.mockResolvedValue(null);

        const res = await request(app)
            .get('/boards/')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ boards: mockBoards });
    });

    it('should return boards and recently viewed board if user is found and recently viewed board is found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const userId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: userId, username: 'testuser', recentlyViewedBoardId: boardId };
        const mockBoards = [{ title: 'Test Board', createdBy: 'userId', createdBy: 'userId', members: [] }];
        const mockRecentlyViewedBoard = { _id: boardId, title: 'Recently Viewed Board', members: [mockUser._id], createdBy: mockUser._id };

        getUser.mockResolvedValue(mockUser);

        const boardFindQuery = {
            sort: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockBoards),
        };

        Board.find.mockReturnValue(boardFindQuery);

        Board.findById.mockResolvedValue(mockRecentlyViewedBoard);

        const res = await request(app)
            .get('/boards/')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ boards: mockBoards, recentlyViewedBoard: mockRecentlyViewedBoard });
    });
});
