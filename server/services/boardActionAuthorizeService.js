const Board = require('../models/Board');

/**
 * Check if this action authorized (by user and board)
 *
 * @param {String} boardId
 * @param {String} userId
 */
const isActionAuthorized = async (boardId, userId, opt = { ownerOnly: false }) => {
    const board = await Board.findById(boardId);
    if (!board) return false;

    const ownerOnly = opt.ownerOnly;

    if (ownerOnly === false && (board.createdBy.toString() === userId || board.members.includes(userId))) {
        return {
            board,
            authorized: true
        }
    }

    if (ownerOnly === true && board.createdBy.toString() === userId) {
        return {
            board,
            authorized: true
        }
    }

    return {
        authorized: false
    }
};

module.exports = {
    isActionAuthorized
};
