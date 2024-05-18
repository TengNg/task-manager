const crypto = require('crypto');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { cardById } = require('../../../services/cardService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/Card');
jest.mock('../../../services/cardService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('POST /cards/:id/copy', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if card is not found', async () => {
        const cardId = new mongoose.Types.ObjectId().toString();
        cardById.mockResolvedValue(null);
        const res = await request(app)
            .post(`/cards/${cardId}/copy`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not found', async () => {
        const cardId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: cardId, boardId, listId, save: jest.fn() };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .post(`/cards/${mockCard._id}/copy`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if user & card are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), trackedId: crypto.randomUUID(), priority: "none", title: "test card", boardId, listId };
        const mockUser = { _id: new mongoose.Types.ObjectId().toString() };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .post(`/cards/${mockCard._id}/copy`)
            .send({ rank: 1 })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});
