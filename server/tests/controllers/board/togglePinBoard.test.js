const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const User = require('../../../models/User');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/User');

describe('PUT /boards/:id/pinned', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null, board: null });
        const res = await request(app)
            .put(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 200 and board is pinned if user is found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', pinnedBoardIdCollection: null, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [], save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        User.findOneAndUpdate = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnValue({ save: jest.fn() })
        }));
        const res = await request(app)
            .put(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    it('should return 200 and board is un-pinned if user is found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', pinnedBoardIdCollection: { [boardId]: true }, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [], save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        User.findOneAndUpdate = jest.fn().mockImplementation(() => ({
            select: jest.fn().mockReturnValue({ save: jest.fn() })
        }));
        const res = await request(app)
            .put(`/boards/${boardId}/pinned`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

