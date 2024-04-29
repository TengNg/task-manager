const mongoose = require('mongoose');
const { MAX_CARD_COUNT } = require('../data/limits');

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

    owner: {
        type: String,
        default: null,
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

cardSchema.pre('save', async function(next) {
    if (this.isNew) {
        const List = mongoose.model('List');
        const foundList = await List.findById(this.listId);
        if (foundList && foundList.cardCount >= MAX_CARD_COUNT) {
            const error = new Error(`Maximum card count reached for this list (maximum: ${MAX_CARD_COUNT})`);
            return next(error);
        }
    }
    next();
});

cardSchema.post('save', async function(doc, next) {
    const List = mongoose.model('List');
    await List.updateOne({ _id: doc.listId }, { $inc: { cardCount: 1 } });
    next();
});

cardSchema.post('findOneAndDelete', async function(doc) {
    const listId = doc.listId;
    const List = mongoose.model('List');
    await List.findOneAndUpdate({ _id: listId }, { $inc: { cardCount: -1 } });
});

module.exports = mongoose.model('Card', cardSchema);
