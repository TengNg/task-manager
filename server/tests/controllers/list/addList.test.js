const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { isActionAuthorized } = require('../../../services/boardActionAuthorizeService');
jest.mock('../../../models/List');
jest.mock('../../../services/boardActionAuthorizeService');

describe('POST /lists', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        isActionAuthorized.mockResolvedValue({ authorized: false, user: null });
        const res = await request(app)
            .post(`/lists`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should return 201 if user & list are found', async () => {
        const mockUser = { _id: new mongoose.Types.ObjectId().toString(), username: 'testuser' };
        isActionAuthorized.mockResolvedValue({ authorized: true, user: mockUser });
        const res = await request(app)
            .post(`/lists`)
            .send({
                rank: "1",
                boardId: new mongoose.Types.ObjectId().toString(),
                title: "test",
            })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(201);
    });
});
