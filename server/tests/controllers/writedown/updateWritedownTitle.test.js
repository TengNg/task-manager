const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const { handleAuthorizationAndGetWritedown } = require('../../../services/writedownService');

jest.mock('../../../services/writedownService');

describe('PUT /personal_writedowns/:id/update-title', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 if authorized', async () => {
        const writedownId = 'writedownId';
        const mockWritedown = { _id: writedownId, owner: 'userId', title: 'Test title 1', save: jest.fn() }
        handleAuthorizationAndGetWritedown.mockResolvedValue({ writedown: mockWritedown });
        const res = await request(app)
            .put(`/personal_writedowns/${writedownId}/update-title`)
            .send({ title: 'Test title 2' })
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            message: 'writedown updated',
            newTitle: 'Test title 2'
        });
    });
});
