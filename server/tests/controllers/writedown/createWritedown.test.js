const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { saveNewWritedown } = require('../../../services/writedownService');
const { userByUsername: getUser } = require('../../../services/userService');

jest.mock('../../../services/userService');
jest.mock('../../../services/writedownService');

describe('POST /personal_writedowns', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 403 if user is not found', async () => {
        getUser.mockResolvedValue(null);
        const res = await request(app)
            .post(`/personal_writedowns`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(403);
        expect(res.body.msg).toEqual('user not found');
    });

    it('should return 200 if user is found', async () => {
        const mockUser = { _id: 'userId', username: 'testuser', recentlyViewedBoardId: null, save: jest.fn() };
        const mockWritedown = { _id: 'userId', owner: mockUser._id };
        getUser.mockResolvedValue(mockUser);
        saveNewWritedown.mockResolvedValue(mockWritedown);
        const res = await request(app)
            .post(`/personal_writedowns`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.msg).toEqual('new writedown added');
        expect(res.body.newWritedown).toEqual(mockWritedown);
    });
});
