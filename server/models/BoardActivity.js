const mongoose = require('mongoose');

const boardActivitySchema = new mongoose.Schema({
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
    },

    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
    },

    type: {
        type: String,
        enum: ['board', 'list', 'card'],
        required: true,
    },

    action: {
        type: String,
        required: true,
    },

    description: {
        type: String
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, { collection: 'board_activities' });

module.exports = mongoose.model('BoardActivity', boardActivitySchema);
