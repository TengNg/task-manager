const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { userByUsername: getUser } = require('../../../services/userService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('DELETE /boards/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        getUser.mockResolvedValue(null);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null, board: null });
        const res = await request(app)
            .delete(`/boards/${boardId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 200 if user & board are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, title: 'Old Title', members: [mockUser._id], save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        const res = await request(app)
            .delete(`/boards/${boardId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

