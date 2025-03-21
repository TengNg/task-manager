const CardComment = require("../models/CardComment");
const { cardById } = require("../services/cardService");

const getCardComments = async (req, res) => {
    const { cardId } = req.params;
    const foundCard = await cardById(cardId, { lean: true });
    if (!foundCard) {
        return res.status(404).json({ error: 'Card not found' });
    }

    let { perPage, page } = req.query;
    perPage = +perPage || 5;
    page = +page || 1;

    const comments = await CardComment
        .find({ cardId: foundCard._id })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate('userId', '_id username avatar')
        .sort({ createdAt: -1 })
        .select('_id content createdAt')
        .lean();

    const nextPage = comments.length < perPage ? null : page + 1;
    res.status(200).json({ comments, nextPage });
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

    const commentWithUser = await CardComment
        .findById(newComment._id)
        .populate('userId', '_id username avatar')
        .lean();

    res.status(200).json({ comment: commentWithUser });
};

const deleteCardComment = async (req, res) => {
    const { userId } = req.user;
    const { commentId } = req.params;
    const foundComment = await CardComment.findById(commentId);
    if (!foundComment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    if (foundComment.userId.toString() !== userId) {
        return res.status(403).json({ msg: 'unauthorized' });
    }

    await CardComment.findOneAndDelete({ _id: commentId });
    res.status(200).json({ message: 'Comment removed successfully' });
};

module.exports = {
    getCardComments,
    createCardComment,
    deleteCardComment,
};
