const mongoose = require('mongoose');
const { MAX_LIST_COUNT } = require('../data/limits');

const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    order: {
        type: String,
        required: true,
    },

    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

 listSchema.pre('save', async function(next) {
     if (this.isNew) {
         const Board = mongoose.model('Board');
         const foundBoard = await Board.findById(this.boardId).lean();
         if (foundBoard && foundBoard.listCount >= MAX_LIST_COUNT) {
             const error = new Error(`Maximum list count reached for this board (maximum: ${MAX_LIST_COUNT})`);
             return next(error);
         }
     }
     next();
 });

 listSchema.post('save', async function(doc, next) {
     const Board = mongoose.model('Board');
     await Board.updateOne({ _id: doc.boardId }, { $inc: { listCount: 1 } });
     next();
 });

listSchema.post('findOneAndDelete', async function(doc) {
    const Card = mongoose.model('Card');
    const documentId = doc._id;
    await Card.deleteMany({ listId: documentId });
});

module.exports = mongoose.model('List', listSchema);
