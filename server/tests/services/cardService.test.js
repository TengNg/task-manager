const { cardById } = require('../../services/cardService');
const Card = require('../../models/Card');

jest.mock('../../models/Card');

describe('cardById', () => {
    let findByIdMock;
    let mockCard = { _id: 'testcardid', title: 'Test Card' };

    beforeEach(() => {
        findByIdMock = {
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockCard)
        };

        Card.findById.mockReturnValue(findByIdMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call lean when option.lean is true', async () => {
        const id = mockCard._id;
        const option = { lean: true };

        const result = await cardById(id, option).exec();

        expect(Card.findById).toHaveBeenCalledWith(id);
        expect(findByIdMock.lean).toHaveBeenCalled();
        expect(result).toEqual(mockCard);
    });

    it('should not call lean when option.lean is false', async () => {
        const id = mockCard._id;
        const option = { lean: false };

        const result = await cardById(id, option).exec();

        expect(Card.findById).toHaveBeenCalledWith(id);
        expect(findByIdMock.lean).not.toHaveBeenCalled();
        expect(result).toEqual(mockCard);
    });

    it('should default to lean when option is not provided', async () => {
        const id = mockCard._id;

        const result = await cardById(id).exec();

        expect(Card.findById).toHaveBeenCalledWith(id);
        expect(findByIdMock.lean).toHaveBeenCalled();
        expect(result).toEqual(mockCard);
    });
});

