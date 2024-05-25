const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const BoardMembership = require('../../../models/BoardMembership');
const { userByUsername: getUser } = require('../../../services/userService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/BoardMembership');

describe('PUT /boards/:id/members/leave', () => {
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
            .put(`/boards/${boardId}/members/leave`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 404 if member not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, title: 'Old Title', members: [], save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        const res = await request(app)
            .put(`/boards/${boardId}/members/leave`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toEqual('Member not found');
    });

    it('should return 200 if user & board & member are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const title = 'Test Title';
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, title: 'Old Title', members: [mockUser._id], save: jest.fn() };
        const mockBoardMembership = { _id: new mongoose.Types.ObjectId().toString(), boardId: boardId, userId: mockUser._id, role: 'member' };
        getUser.mockResolvedValue(mockUser);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        BoardMembership.findOne.mockResolvedValue(mockBoardMembership);
        const res = await request(app)
            .put(`/boards/${boardId}/members/leave`)
            .send({ title })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

