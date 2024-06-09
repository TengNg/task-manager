const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const User = require('../../../models/User');
const Board = require('../../../models/Board');
const List = require('../../../models/List');
const BoardMembership = require('../../../models/BoardMembership');

describe('GET /boards/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if board ID is invalid', async () => {
        const invalidId = '123';

        const res = await request(app)
            .get(`/boards/${invalidId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('msg', 'board not found');
    });

    it('should return 403 if user is not found', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        User.findOne = jest.fn().mockResolvedValue(null);

        const res = await request(app)
            .get(`/boards/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('msg', 'user not found');
    });

    it('should return 404 if board is not found', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', password: '12345678' };

        User.findOne = jest.fn().mockResolvedValueOnce(mockUser);

        Board.findOne = jest.fn().mockImplementation(() => ({
            populate: () => ({
                populate: () => null
            })
        }));

        const res = await request(app)
            .get(`/boards/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ msg: 'board not found' });
    });

    it('should return the board, lists with cards, and memberships on success', async () => {
        const validId = new mongoose.Types.ObjectId().toString();
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockBoard = { _id: validId, createdBy: mockUser._id, listCount: 1, save: jest.fn() };
        const mockLists = [{ _id: 'listId', boardId: validId, order: 1 }];
        const mockListsWithCards = [{ _id: 'listId', boardId: validId, order: 1, cards: [] }];
        const mockMemberships = [{ boardId: validId, userId: 'userId' }];

        User.findOne = jest.fn().mockResolvedValueOnce(mockUser);

        Board.findOne = jest.fn().mockImplementation(() => ({
            populate: () => ({
                populate: () => mockBoard
            })
        }));

        List.find = jest.fn().mockImplementation(() => ({
            sort: () => mockLists
        }));

        List.aggregate = jest.fn().mockResolvedValueOnce(mockListsWithCards);

        BoardMembership.find = jest.fn().mockImplementation(() => ({
            lean: () => mockMemberships
        }));

        const res = await request(app)
            .get(`/boards/${validId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            board: { _id: validId, createdBy: mockUser._id, listCount: 1 },
            lists: mockListsWithCards,
            memberships: mockMemberships,
            hasStaleCard: false,
        });
    }, 60000);
});

