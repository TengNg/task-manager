const mongoose = require('mongoose');

const User = require('../../models/User');
const Board = require('../../models/Board');

const { isActionAuthorized } = require('../../services/boardActionAuthorizeService');

jest.mock('../../models/User');
jest.mock('../../models/Board');

describe('isActionAuthorized', () => {
    const userId = new mongoose.Types.ObjectId();
    const boardMemberId = new mongoose.Types.ObjectId();
    const boardId = new mongoose.Types.ObjectId();

    let mockUser, mockBoardMember, mockBoard;

    beforeEach(() => {
        mockUser = {
            _id: userId,
            username: 'testuser',
        }

        mockBoardMember = {
            _id: boardMemberId,
            username: 'testboardmember',
        }

        mockBoard = {
            _id: userId,
            createdBy: userId,
            members: [boardMemberId]
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return false if user is not found', async () => {
        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => null
        }));

        const result = await isActionAuthorized(boardId, mockUser.username);
        expect(result).toBe(false);
    });

    it('should return false if board is not found', async () => {
        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => mockUser
        }));

        Board.findById.mockResolvedValue(null);
        const result = await isActionAuthorized(boardId, mockUser.username);
        expect(result).toBe(false);
    });

    it('should return authorized true if user is board owner and ownerOnly is false', async () => {
        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => mockUser
        }));

        Board.findById.mockResolvedValue(mockBoard);

        const result = await isActionAuthorized(boardId, mockUser.username);

        expect(result).toEqual({
            board: mockBoard,
            user: mockUser,
            authorized: true
        });
    });

    it('should return authorized true if user is not a board owner and ownerOnly is true', async () => {
        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => mockUser
        }));

        Board.findById.mockResolvedValue(mockBoard);

        const result = await isActionAuthorized(boardId, mockUser.username, { ownerOnly: true });

        expect(result).toEqual({
            board: mockBoard,
            user: mockUser,
            authorized: true,
        });
    });

    it('should return authorized true if user is a board member and ownerOnly is false', async () => {
        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => mockBoardMember
        }));

        Board.findById.mockResolvedValue(mockBoard);

        const result = await isActionAuthorized(boardId, mockUser.username);

        expect(result).toEqual({
            board: mockBoard,
            user: mockBoardMember,
            authorized: true
        });
    });

    it('should return authorized false if user is not a board owner or board member', async () => {
        const unauthorized_user = {
            _id: 'unauthorized_id',
            username: 'unauthorized_username',
        }

        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => unauthorized_user
        }));

        Board.findById.mockResolvedValue(mockBoard);

        const result = await isActionAuthorized(boardId, mockUser.username);

        expect(result).toEqual({
            authorized: false
        });
    });

    it('should return authorized false if user is not a board owner or board member and ownerOnly is true', async () => {
        const unauthorized_user = {
            _id: 'unauthorized_id',
            username: 'unauthorized_username',
        }

        User.findOne = jest.fn().mockImplementation(() => ({
            lean: () => unauthorized_user
        }));

        Board.findById.mockResolvedValue(mockBoard);

        const result = await isActionAuthorized(boardId, mockUser.username, { ownerOnly: true });

        expect(result).toEqual({
            authorized: false
        });
    });
});
