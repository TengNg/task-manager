const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        default: undefined,
    },

    order: {
        type: String,
        required: true,
    },

    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },

    updatedBy: {
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

module.exports = mongoose.model('Card', cardSchema);;
