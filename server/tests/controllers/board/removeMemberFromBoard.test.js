const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { userByUsername: getUser } = require('../../../services/userService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('PUT /boards/:id/members/:memberName', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockMember = { _id: 'userId', username: 'testmember', recentlyViewedBoardId: null, save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null, board: null });
        const res = await request(app)
            .put(`/boards/${boardId}/members/${mockMember.username}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.error).toEqual('unauthorized');
    });

    it('should return 401 if member is not found', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const memberId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: userId, username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockMember = { _id: memberId, username: 'testmember', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [mockUser._id], createdBy: mockUser._id, save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        getUser.mockResolvedValue(null);
        const res = await request(app)
            .put(`/boards/${boardId}/members/${mockMember.username}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toEqual('unauthorized');
    });

    it('should return 401 if member is the owner of the board', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const memberId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: userId, username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockMember = { _id: memberId, username: 'testmember', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [mockUser._id], createdBy: mockMember._id, save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        getUser.mockResolvedValue(mockMember);
        const res = await request(app)
            .put(`/boards/${boardId}/members/${mockMember.username}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toEqual('unauthorized');
    });

    it('should return 404 if member is not from the board', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const memberId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: userId, username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockMember = { _id: memberId, username: 'testmember', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [], createdBy: mockUser._id, save: jest.fn() };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        getUser.mockResolvedValue(mockMember);
        const res = await request(app)
            .put(`/boards/${boardId}/members/${mockMember.username}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toEqual('Member not found in the board');
    });

    it('should return 200 if user, member, board are found & member is from the board & member is not the owner', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const memberId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: userId, username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockMember = { _id: memberId, username: 'testmember', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, members: [mockMember._id], createdBy: mockUser._id, save: jest.fn() };
        getUser.mockResolvedValue(mockMember);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        const res = await request(app)
            .put(`/boards/${boardId}/members/${mockMember.username}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

