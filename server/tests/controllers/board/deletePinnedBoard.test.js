const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const User = require('../../../models/User');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/User');

describe('DELETE /boards/:id/pinned', () => {
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
        const res = await request(app)
            .delete(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('user not found');
    });

    it('should return 404 if pinned board is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', pinnedBoardIdCollection: null, save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        User.findOneAndUpdate = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnValue({ save: jest.fn() })
        }));
        const res = await request(app)
            .delete(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.msg).toEqual('pinned board not found');
    });

    it('should return 200 if pinned board and user are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const pinnedBoardIdCollection = new Map();
        pinnedBoardIdCollection.set(boardId, true);
        const mockUser = { _id: 'userId', username: 'testuser', pinnedBoardIdCollection, save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        User.findOneAndUpdate = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnValue({ save: jest.fn() })
        }));
        const res = await request(app)
            .delete(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

