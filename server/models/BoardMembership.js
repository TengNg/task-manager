const mongoose = require('mongoose');

const boardMembershipSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    role: {
        type: String,
        enum: ['owner', 'member'],
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { collection: 'board_memberships' });

boardMembershipSchema.index({ boardId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('BoardMembership', boardMembershipSchema);
