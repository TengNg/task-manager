const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        dropDups: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    refreshToken: {
        type: String,
        default: null,
    },

    recentlyViewedBoardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
    },
});

module.exports = mongoose.model('User', UserSchema);

