const CardComment = require("../models/CardComment");
const { cardById } = require("../services/cardService");

const getCardComments = async (req, res) => {
    const { cardId } = req.params;
    const foundCard = await cardById(cardId, { lean: true });
    if (!foundCard) {
        return res.status(404).json({ error: 'Card not found' });
    }

    const comments = await CardComment
        .find({ cardId: foundCard._id })
        .populate('userId', 'username avatar')
        .sort({ createdAt: 1 })
        .select('_id content createdAt')
        .lean();
    res.status(200).json({ comments });
};

const createCardComment = async (req, res) => {
    const { cardId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;
    const foundCard = await cardById(cardId, { lean: true });
    if (!foundCard) {
        return res.status(404).json({ error: 'Card not found' });
    }

    const newComment = new CardComment({
        cardId: foundCard._id,
        userId,
        content,
    });
    await newComment.save();
    res.status(200).json({ comment: newComment });
};

const deleteCardComment = async (req, res) => {
    const { id } = req.params;
    const foundComment = await CardComment.findById(id);
    if (!foundComment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    await CardComment.findOneAndDelete({ _id: id });
    res.status(200).json({ message: 'Comment removed successfully' });
};

module.exports = {
    getCardComments,
    createCardComment,
    deleteCardComment,
};
