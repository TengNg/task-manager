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

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // labels: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Label',
    // }],
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;

