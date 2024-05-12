const mongoose = require('mongoose');
const { MAX_BOARD_COUNT } = require('../data/limits');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: "",
    },

    visibility: {
        type: String,
        enum: ['private', 'public'],
        default: 'private',
        required: true,
    },

    listCount: {
        type: Number,
        default: 0
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

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
});

// update list count & save new board_membership
boardSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Board = mongoose.model('Board');
        const boardCount = await Board.countDocuments({ createdBy: this.createdBy });

        if (boardCount >= MAX_BOARD_COUNT) {
            const error = new Error(`Maximum board count reached (maximum: ${MAX_BOARD_COUNT})`);
            return next(error);
        }

        const BoardMembership = mongoose.model('BoardMembership');
        await BoardMembership.create({
            boardId: this._id,
            userId: this.createdBy,
            role: 'owner',
        });
    }
});

// // delete all related board_memberships
// boardSchema.post('findOneAndDelete', async function(doc, _next) {
//     const BoardMembership = mongoose.model('BoardMembership');
//     await BoardMembership.deleteMany({ boardId: doc._id, });
// });

module.exports = mongoose.model('Board', boardSchema);
