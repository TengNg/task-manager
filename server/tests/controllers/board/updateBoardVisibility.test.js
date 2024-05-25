const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { userByUsername: getUser } = require('../../../services/userService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');
const saveBoardActivity = require('../../../services/saveBoardActivity');

jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../services/saveBoardActivity');

describe('PUT /boards/:id/new-visibility', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const visibility = 'private';
        getUser.mockResolvedValue(null);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null, board: null });
        const res = await request(app)
            .put(`/boards/${boardId}/new-visibility`)
            .send({ visibility })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 200 if user is found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const visibility = 'private';
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, visibility: 'public', members: [], save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        saveBoardActivity.mockResolvedValue({});
        const res = await request(app)
            .put(`/boards/${boardId}/new-visibility`)
            .send({ visibility })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

