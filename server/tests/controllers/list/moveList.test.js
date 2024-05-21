const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { lexorank } = require('../../../lib/lexorank');

const List = require('../../../models/List');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/List');
jest.mock('../../../lib/lexorank');
jest.mock('../../../services/boardActionAuthorizeService');

describe('PUT /move/:id/b/:boardId/i/:index', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if list is not found', async () => {
        const indexToMove = 0;
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        List.findById = jest.fn().mockImplementation(() => null);
        const res = await request(app)
            .put(`/lists/move/${listId}/b/${boardId}/i/${indexToMove}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('List not found');
    });

    it('should return 403 if user is not found', async () => {
        const indexToMove = 0;
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        List.findById = jest.fn().mockImplementation(() => mockList);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .put(`/lists/move/${listId}/b/${boardId}/i/${indexToMove}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 403 if inserted index is not valid', async () => {
        const indexToMove = 0;
        const userId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        const mockUser = { _id: userId, username: 'testuser' };

        const mockLists = [{ _id: 'listId', boardId, order: 1 }];

        List.findById = jest.fn().mockImplementation(() => mockList);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });

        List.find = jest.fn().mockImplementation(() => ({
            sort: () => mockLists
        }));

        // mock inserted index is not valid
        lexorank.insert = jest.fn().mockImplementation(() => ([1, false]));

        const res = await request(app)
            .put(`/lists/move/${listId}/b/${boardId}/i/${indexToMove}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if list & user are found', async () => {
        const indexToMove = 0;
        const userId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        const mockUser = { _id: userId, username: 'testuser' };

        const mockLists = [{ _id: 'listId', boardId, order: 1 }];

        List.findById = jest.fn().mockImplementation(() => mockList);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });

        List.find = jest.fn().mockImplementation(() => ({
            sort: () => mockLists
        }));

        lexorank.insert = jest.fn().mockImplementation(() => ([1, true]));

        const res = await request(app)
            .put(`/lists/move/${listId}/b/${boardId}/i/${indexToMove}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });
});
