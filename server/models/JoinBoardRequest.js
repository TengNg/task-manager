const mongoose = require('mongoose');

const joinBoardRequestSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    updatedAt: {
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

// add unique index [boardId, requester<->userId]
joinBoardRequestSchema.index({ boardId: 1, requester: 1 }, { unique: true });

// update 'updatedAt' field when 'status' is modified
joinBoardRequestSchema.pre('findOneAndUpdate', function(next) {
    console.log('findOneAndUpdate');

    this._update.updatedAt = new Date();
    console.log(this._update);
    next();
});

module.exports = mongoose.model('join_board_requests', joinBoardRequestSchema);
