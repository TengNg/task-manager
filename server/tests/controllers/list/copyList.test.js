const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const Card = require('../../../models/Card');
const List = require('../../../models/List');
const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');
const { saveList } = require('../../../services/listService');
const saveBoardActivity = require('../../../services/saveBoardActivity');

jest.mock('../../../models/Card');
jest.mock('../../../models/List');
jest.mock('../../../services/boardActionAuthorizeService');
jest.mock('../../../services/saveBoardActivity');
jest.mock('../../../services/listService');

describe('POST /copy/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if list is not found', async () => {
        const listId = new mongoose.Types.ObjectId().toString();
        List.findById = jest.fn().mockImplementation(() => null);
        const res = await request(app)
            .post(`/lists/copy/${listId}/`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('List not found');
    });

    it('should return 403 if user is not found', async () => {
        const listId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        List.findById = jest.fn().mockImplementation(() => mockList);
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .post(`/lists/copy/${listId}/`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('unauthorized');
    });

    it('should return 200 if user & list are found', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const listId = new mongoose.Types.ObjectId().toString();
        const cardId = new mongoose.Types.ObjectId().toString();
        const mockList = { _id: listId, save: jest.fn() };
        const mockUser = { _id: userId, username: 'testuser' };
        const mockCard = { _id: cardId };
        const mockCards = [mockCard];
        List.findById = jest.fn().mockImplementation(() => mockList);
        saveList.mockResolvedValue(mockList);
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        Card.find.mockReturnValue(mockCards);
        saveBoardActivity.mockImplementation(() => {});
        const res = await request(app)
            .post(`/lists/copy/${listId}/`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});
