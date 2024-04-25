const mongoose = require('mongoose');

const joinBoardRequestSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    requestedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
});

module.exports = mongoose.model('join_board_requests', joinBoardRequestSchema);

