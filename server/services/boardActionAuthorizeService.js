const User = require('../models/User');
const Board = require('../models/Board');

const isActionAuthorized = async (boardId, username, option = { ownerOnly: false }) => {
    const foundUser = await User.findOne({ username }).lean();
    if (!foundUser) return false;

    const board = await Board.findById(boardId);
    if (!board) return false;

    const { ownerOnly } = option;

    if (ownerOnly === false && (board.createdBy.toString() === foundUser._id.toString() || board.members.includes(foundUser._id))) {
        return {
            board,
            user: foundUser,
            authorized: true
        }
    }

    if (ownerOnly === true && board.createdBy.toString() === foundUser._id.toString()) {
        return {
            board,
            user: foundUser,
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
