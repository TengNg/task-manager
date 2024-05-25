const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const Card = require('../../../models/Card');
const Board = require('../../../models/Board');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../services/userService');

describe('GET /boards/:id/stats', () => {
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
            .get(`/boards/${boardId}/stats`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('user not found');
    });

    it('should return 403 if board is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        // const mockBoard = { _id: boardId, title: 'Old Title', members: [mockUser._id], save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        Board.findById = jest.fn().mockImplementation(() => ({
            populate: () => ({
                populate: () => ({
                    lean: () => null
                })
            })
        }));
        const res = await request(app)
            .get(`/boards/${boardId}/stats`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('board not found');
    });

    it('should return 200 if user & board are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: boardId, title: 'Old Title', members: [mockUser._id], save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        Board.findById = jest.fn().mockImplementation(() => ({
            populate: () => ({
                populate: () => ({
                    lean: () => mockBoard
                })
            })
        }));
        Card.aggregate = jest.fn().mockImplementation(() => [])
        const res = await request(app)
            .get(`/boards/${boardId}/stats`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});

