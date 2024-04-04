const mongoose = require('mongoose');
const MAX_BOARD_COUNT = 8;

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    listCount: {
        type: Number,
        default: 0
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    lastViewed: Date,
});

boardSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Board = mongoose.model('Board');
        const boardCount = await Board.countDocuments({ createdBy: this.createdBy });
        if (boardCount >= MAX_BOARD_COUNT) {
            const error = new Error(`Maximum board count reached (maximum: ${MAX_BOARD_COUNT})`);
            return next(error);
        }
    }
});

module.exports = mongoose.model('Board', boardSchema);
