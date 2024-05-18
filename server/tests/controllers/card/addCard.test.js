const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { listById } = require('../../../services/listService');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');

jest.mock('../../../models/Board');
jest.mock('../../../models/User');
jest.mock('../../../models/List');
jest.mock('../../../services/listService');
jest.mock('../../../services/userService');
jest.mock('../../../services/boardActionAuthorizeService');

describe('POST /cards', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if request body params in empty', async () => {
        const res = await request(app)
            .post('/cards/')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 403 if list is not found', async () => {
        listById.mockResolvedValue(null);

        const res = await request(app)
            .post('/cards/')
            .send({ listId: 'listId' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('msg', 'list not found');
    });

    it('should return 403 if user is not found', async () => {
        const mockList = { _id: 'listId', boardId: 'boardId', order: 1, title: 'Test List', createdAt: Date.now() };
        listById.mockResolvedValue(mockList);
        isActionAuthorized.mockResolvedValue({ authorized: false });
        const res = await request(app)
            .post('/cards/')
            .send({ listId: 'listId' })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 200 if user & list are found', async () => {
        const listId = new mongoose.Types.ObjectId().toString();
        const boardId = new mongoose.Types.ObjectId().toString();
        const userId = new mongoose.Types.ObjectId().toString();

        const newCardTitle = "Test Card";
        const newCardOrder = "1";

        const mockList = { _id: listId, boardId, order: 1, title: 'Test List', createdAt: Date.now() };
        const mockUser = { _id: userId, username: 'testuser' };

        listById.mockResolvedValue(mockList);
        isActionAuthorized.mockResolvedValue({ user: mockUser, authorized: true });

        const res = await request(app)
            .post('/cards/')
            .send({
                listId,
                boardId,
                title: newCardTitle,
                order: newCardOrder,
            })
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(201);

        const { newCard } = res.body;
        expect(newCard.title).toEqual(newCardTitle);
        expect(newCard.order).toEqual(newCardOrder);
        expect(newCard.listId).toEqual(listId);
        expect(newCard.boardId).toEqual(boardId);
    });
});
