const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../../server');

const Writedown = require('../../../models/Writedown');

const { handleAuthorizationAndGetWritedown } = require('../../../services/writedownService');

jest.mock('../../../services/writedownService');
jest.mock('../../../models/Writedown');

describe('DELETE /personal_writedowns/:id', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ username: 'testuser' }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 if authorized', async () => {
        const writedownId = 'writedownId';
        const mockWritedown = { _id: writedownId, owner: 'userId', pinned: false, save: jest.fn() }
        handleAuthorizationAndGetWritedown.mockResolvedValue({ writedown: mockWritedown });
        Writedown.findByIdAndDelete.mockResolvedValue(true);
        const res = await request(app)
            .delete(`/personal_writedowns/${writedownId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });
});
