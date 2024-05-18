const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const List = require('../../../models/List');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/List');
jest.mock('../../../services/boardActionAuthorizeService');

describe('DELETE /lists/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if list is not found', async () => {
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        List.findById = jest.fn().mockImplementation(() => null);
        const res = await request(app)
            .delete(`/lists/${mockList._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 403 if user is not found', async () => {
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        List.findById = jest.fn().mockImplementation(() => null);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .delete(`/lists/${mockList._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 201 if user & list are found', async () => {
        const mockUser = { _id: new mongoose.Types.ObjectId().toString(), username: 'testuser' };
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, boardId: new mongoose.Types.ObjectId().toString(), save: jest.fn() };
        List.findById = jest.fn().mockImplementation(() => mockList);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .delete(`/lists/${mockList._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('list deleted');
    });
});
