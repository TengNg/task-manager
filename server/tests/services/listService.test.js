const { listById, saveList } = require('../../services/listService');
const List = require('../../models/List');

jest.mock('../../models/List');

describe('listService', () => {
    let findByIdMock;
    let mockList = { _id: 'test_list_id', title: 'Test List' }

    beforeEach(() => {
        findByIdMock = {
            lean: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockList)
        };

        List.findById.mockReturnValue(findByIdMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listById', () => {
        it('should call lean when option.lean is true', async () => {
            const id = mockList._id;
            const option = { lean: true };

            const result = await listById(id, option).exec();

            expect(List.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).toHaveBeenCalled();
            expect(result).toEqual(mockList);
        });

        it('should not call lean when option.lean is false', async () => {
            const id = mockList._id;
            const option = { lean: false };

            const result = await listById(id, option).exec();

            expect(List.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).not.toHaveBeenCalled();
            expect(result).toEqual(mockList);
        });

        it('should default to lean when option is not provided', async () => {
            const id = mockList._id;

            const result = await listById(id).exec();

            expect(List.findById).toHaveBeenCalledWith(id);
            expect(findByIdMock.lean).toHaveBeenCalled();
            expect(result).toEqual(mockList);
        });
    });

    describe('saveList', () => {
        it('should save a new list', async () => {
            const listData = { title: 'New List' };
            const listId = 'mock_list_id';
            const saveMock = jest.fn().mockResolvedValue({ _id: listId, ...listData });
            List.mockImplementation(() => ({
                save: saveMock
            }));

            const result = await saveList(listData);

            expect(List).toHaveBeenCalledWith(listData);
            expect(saveMock).toHaveBeenCalled();
            expect(result).toEqual({ _id: listId, title: 'New List' });
        });

        it('should handle errors during save', async () => {
            const listData = { title: 'New List' };
            const error = new Error('Save failed');
            const saveMock = jest.fn().mockRejectedValue(error);
            List.mockImplementation(() => ({
                save: saveMock
            }));

            await expect(saveList(listData)).rejects.toThrow('Save failed');
        });
    });
});

