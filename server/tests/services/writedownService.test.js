const { saveNewWritedown, findWritedown, writedownsByUserId } = require('../../services/writedownService');
const Writedown = require('../../models/Writedown');

jest.mock('../../models/Writedown');

describe('writedownService', () => {
    let findByIdMock;
    let mockWritedown = { _id: 'test_list_id', title: 'Test List' }

    beforeEach(() => {
        findByIdMock = {
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockWritedown)
        };

        Writedown.findById.mockReturnValue(findByIdMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('saveNewWritedown', () => {
        it('should save a new writedown', async () => {
            const writedownId = 'mock_id';
            const writedownData = {
                _id: writedownId,
                ...mockWritedown
            }

            const saveMock = jest.fn().mockResolvedValue(writedownData);

            Writedown.mockImplementation(() => ({
                save: saveMock
            }));

            const result = await saveNewWritedown(writedownData);

            expect(Writedown).toHaveBeenCalledWith(writedownData);
            expect(saveMock).toHaveBeenCalled();
            expect(result).toEqual(writedownData);
        });
    });

    describe('findWritedown', () => {
        it('should call lean when option.lean is true', async () => {
            const id = mockWritedown._id;
            const option = { lean: true };
            const result = await findWritedown(id, option);
            const a = await result.exec();
            expect(Writedown.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).toHaveBeenCalled();
            expect(a).toEqual(mockWritedown);
        });

        it('should not call lean when option.lean is false', async () => {
            const id = mockWritedown._id;
            const option = { lean: false };
            const result = await findWritedown(id, option);
            const a = await result.exec();
            expect(Writedown.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).not.toHaveBeenCalled();
            expect(a).toEqual(mockWritedown);
        });

        it('should default to lean when option is not provided', async () => {
            const id = mockWritedown._id;
            const result = await findWritedown(id);
            const a = await result.exec();
            expect(Writedown.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).toHaveBeenCalled();
            expect(a).toEqual(mockWritedown);
        });
    });

    describe('writedownsByUserId', () => {
        it('should return writedowns', async () => {
            const userId = 'test_user_id';
            const mockWritedowns = [
                { _id: 'test_id_1', title: 'Test', owner: userId },
                { _id: 'test_id_1', title: 'Test', owner: userId },
                { _id: 'test_id_1', title: 'Test', owner: userId },
            ];

            Writedown.find = jest.fn().mockReturnValue({
                sort: () => ({
                    lean: () => mockWritedowns
                })
            });

            const result = await writedownsByUserId(userId);

            expect(result).toEqual(mockWritedowns);
        });
    });
});
