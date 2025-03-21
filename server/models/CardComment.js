const mongoose = require('mongoose');

const cardCommentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true,
    },

    content: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 1000,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { collection: 'card_comments' });

cardCommentSchema.index({ cardId: 1 });

module.exports = mongoose.model('CardComment', cardCommentSchema);
