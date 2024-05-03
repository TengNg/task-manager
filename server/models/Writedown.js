const mongoose = require('mongoose');

const WritedownSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    trackedId: {
        type: String,
        default: crypto.randomUUID(),
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    highlight: {
        type: String,
        default: null,
    },

    rank: {
        type: String,
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
});

WritedownSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.updatedAt = Date.now();
    }

    next();
});

module.exports = mongoose.model('Writedown', WritedownSchema);
