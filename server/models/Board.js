const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    // members: {
    //     type: Array,
    //     default: [],
    // },

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

    // labels: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Label',
    // }],
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;

