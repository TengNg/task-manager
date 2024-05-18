const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { cardById } = require('../../../services/cardService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/Card');
jest.mock('../../../services/cardService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('PUT /cards/:id/new-description', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if card is not found', async () => {
        cardById.mockResolvedValue(null);
        const res = await request(app)
            .put(`/cards/${new mongoose.Types.ObjectId().toString()}/new-description`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .put(`/cards/${mockCard._id}/new-description`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if card & user are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        const mockUser = { _id: new mongoose.Types.ObjectId().toString() };
        cardById.mockResolvedValue(mockCard);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .put(`/cards/${mockCard._id}/new-description`)
            .send({ description: "Test Card" })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('newCard', {
            description: "Test Card",
            _id: mockCard._id,
            boardId,
            listId,
        });
    });
});
