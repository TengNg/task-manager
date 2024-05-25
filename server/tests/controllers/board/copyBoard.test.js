const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const List = require('../../../models/List');
const Card = require('../../../models/Card');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/Board');
jest.mock('../../../models/List');
jest.mock('../../../models/Card');

describe('POST /boards/copy/:id/', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const payload = { title: 'Test Title', description: 'Test Description' }
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null, board: null });
        const res = await request(app)
            .post(`/boards/copy/${boardId}`)
            .send(payload)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 200 if user is found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const payload = { title: 'Test Title', description: 'Test Description' }
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, title: 'Old Title', members: [], save: jest.fn() };
        const mockLists = [{ _id: 'listId', boardId, order: 1 }];
        const mockCards = [{ _id: 'cardId', boardId, listId: 'listId', order: 1 }];
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser, board: mockBoard });
        List.find.mockReturnValue(mockLists);
        Card.find.mockReturnValue(mockCards);
        const res = await request(app)
            .post(`/boards/copy/${boardId}`)
            .send(payload)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

