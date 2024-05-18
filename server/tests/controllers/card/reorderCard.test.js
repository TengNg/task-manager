const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const Card = require('../../../models/Card');

const { listById } = require('../../../services/listService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/Card');
jest.mock('../../../services/cardService');
jest.mock('../../../services/listService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('PUT /cards/:id/reorder', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 if card is not found', async () => {
        Card.findById = jest.fn().mockImplementation(() => ({
            populate: () => null
        }));
        const res = await request(app)
            .put(`/cards/${new mongoose.Types.ObjectId().toString()}/reorder`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 404 if list is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        Card.findById = jest.fn().mockImplementation(() => ({
            populate: () => mockCard
        }));
        listById.mockResolvedValue(null);
        const res = await request(app)
            .put(`/cards/${new mongoose.Types.ObjectId().toString()}/reorder`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 403 if user is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        const mockList = { _id: listId, boardId, order: 1, title: 'Test List' };
        Card.findById = jest.fn().mockImplementation(() => ({
            populate: () => mockCard
        }));
        listById.mockResolvedValue(mockList);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .put(`/cards/${new mongoose.Types.ObjectId().toString()}/reorder`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 404 if card is not found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        Card.findById = jest.fn().mockImplementation(() => ({
            populate: () => mockCard
        }));
        listById.mockResolvedValue(null);
        const res = await request(app)
            .put(`/cards/${new mongoose.Types.ObjectId().toString()}/reorder`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(404);
    });

    it('should return 200 if card & list & user are found', async () => {
        const boardId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const mockCard = { _id: new mongoose.Types.ObjectId().toString(), boardId, listId, save: jest.fn() };
        const mockList = { _id: listId, boardId, order: 1, title: 'Test List' };
        const mockUser = { _id: new mongoose.Types.ObjectId().toString() };
        const { _id: cardId } = mockCard;
        Card.findById = jest.fn().mockImplementation(() => ({
            populate: () => mockCard
        }));
        listById.mockResolvedValue(mockList);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .put(`/cards/${cardId}/reorder`)
            .send({ rank: "1", listId: mockList._id })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('newCard', {
            _id: cardId,
            boardId,
            listId: mockList._id,
            order: "1"
        });
    });
});
