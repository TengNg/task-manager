const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { cardById } = require('../../../services/cardService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/Card');
jest.mock('../../../models/Board');
jest.mock('../../../services/cardService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('DELETE /cards/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if card not found', async () => {
        const mockUser = { _id: 'userId' };
        const cardId = new mongoose.Types.ObjectId().toString();
        cardById.mockResolvedValue(null);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .delete(`/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .delete(`/cards/${mockCard._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if user & list are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId };
        const mockUser = { _id: new mongoose.Types.ObjectId().toString() };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .delete(`/cards/${mockCard._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});
