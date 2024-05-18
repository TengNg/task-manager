const mongoose = require('mongoose');
const crypto = require('crypto');

const cardSchema = new mongoose.Schema({
    trackedId: {
        type: String,
        default: crypto.randomUUID(),
        required: true,
    },

    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },

    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    order: {
        type: String,
        required: true,
    },

    highlight: {
        type: String,
        default: null,
    },

    priorityLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none',
    },

    owner: {
        type: String,
        default: null,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    // labels: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Label',
    // }],
    //
    // comments: [{
    //     text: String,
    //     userId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'User',
    //     },
    // }],
    //
    // attachments: [{
    //     filename: String,
    //     url: String,
    // }],
});

cardSchema.pre('save', function(next) {
    if (!this.isNew) {
        this.updatedAt = Date.now();
    }
    next();
});

module.exports = mongoose.model('Card', cardSchema);
