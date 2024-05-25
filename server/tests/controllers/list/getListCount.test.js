const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const Board = require('../../../models/Board');
const List = require('../../../models/List');

jest.mock('../../../models/List');
jest.mock('../../../models/Board');
jest.mock('../../../services/boardActionAuthorizeService');

describe('GET /lists/:boardId/count', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if board is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        Board.findById.mockResolvedValue(null);
        const res = await request(app)
            .get(`/lists/b/${boardId}/count`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('board not found');
    });

    it('should return 200 if board is not found', async () => {
        const listCount = 2
        const boardId = new mongoose.Types.ObjectId().toString();
        const mockBoard = { _id: boardId };
        Board.findById.mockResolvedValue(mockBoard);
        List.countDocuments.mockResolvedValue(listCount);
        const res = await request(app)
            .get(`/lists/b/${boardId}/count`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.count).toEqual(listCount);
    });
});
