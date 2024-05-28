const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { handleAuthorizationAndGetWritedown } = require('../../../services/writedownService');

jest.mock('../../../services/writedownService');

describe('GET /personal_writedowns/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 if authorized', async () => {
        const writedownId = 'writedownId';
        const mockWritedown = { _id: writedownId, owner: 'userId' }
        handleAuthorizationAndGetWritedown.mockResolvedValue({ writedown: mockWritedown });
        const res = await request(app)
            .get(`/personal_writedowns/${writedownId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.writedown).toEqual(mockWritedown);
    });
});
