const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['MESSAGE', 'CARD_CODE', 'BOARD_CODE'],
        default: 'MESSAGE',
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    trackedId: {
        type: String,
        required: true,
    },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
