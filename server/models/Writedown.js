const mongoose = require('mongoose');

const WritedownSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    title: {
        type: String,
        default: ""
    },

    content: {
        type: String,
        default: ""
    },

    highlight: {
        type: String,
        default: ""
    },

    pinned: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
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
