const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../services/userService');
jest.mock('../../../models/Board');
jest.mock('../../../models/User');

describe('POST /boards', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        const title = 'Test Title';
        const description = 'Test Description';
        getUser.mockResolvedValue(null);
        const res = await request(app)
            .post(`/boards`)
            .send({ title, description })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('user not found');
    });

    it('should return 200 if user is found', async () => {
        const title = 'Test Title';
        const description = 'Test Description';
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        getUser.mockResolvedValue(mockUser);
        const res = await request(app)
            .post(`/boards`)
            .send({ title, description })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(201);
    });
});

