const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { userByUsername } = require('../../../services/userService');
const { cardById } = require('../../../services/cardService');

jest.mock('../../../services/listService');
jest.mock('../../../services/cardService');
jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('GET /cards/:id', () => {
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
        userByUsername.mockResolvedValue(mockUser);
        const res = await request(app)
            .get(`/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 403 if user is not found', async () => {
        const cardId = new mongoose.Types.ObjectId().toString();
        cardById.mockResolvedValue(null);
        userByUsername.mockResolvedValue(null);
        const res = await request(app)
            .get(`/cards/${cardId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if user & list are found', async () => {
        const mockCard = { _id: new mongoose.Types.ObjectId().toString() };
        const mockUser = { _id: new mongoose.Types.ObjectId().toString() };
        cardById.mockResolvedValue(mockCard);
        userByUsername.mockResolvedValue(mockUser);
        const res = await request(app)
            .get(`/cards/${mockCard._id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('card', mockCard);
    });
});
